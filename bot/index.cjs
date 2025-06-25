const TelegramBot = require("node-telegram-bot-api");
const logger = require("./logger.cjs");
const axios = require("axios");
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const apiUrl = process.env.API_URL || "http://localhost:3000/api";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.BOT_TOKEN; // Используем BOT_TOKEN как fallback

// Логируем настройки для отладки
console.log("=== BOT CONFIGURATION ===");
console.log("BOT_TOKEN:", token ? "SET" : "NOT SET");
console.log("WEBAPP_URL:", webAppUrl || "NOT SET");
console.log("API_URL:", apiUrl);
console.log("ADMIN_TOKEN:", ADMIN_TOKEN ? "SET" : "NOT SET");
console.log("=========================");

// Проверка на HTTPS для Web App
if (webAppUrl && !webAppUrl.startsWith("https://")) {
  logger.logError(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
  logger.logError(
    `[SECURITY WARNING] WEBAPP_URL is not HTTPS! Telegram may block requests. Current URL: ${webAppUrl}`
  );
  logger.logError(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
}

// Функция для формирования URL с учетом базового пути
const getWebAppUrl = (path = "") => {
  const baseUrl = webAppUrl.endsWith("/") ? webAppUrl.slice(0, -1) : webAppUrl;
  return path ? `${baseUrl}/#${path}` : baseUrl;
};

const bot = new TelegramBot(token, { polling: true });

// --- Хранилище состояний ---
const userDialogState = {};

// --- ОБРАБОТЧИКИ КОМАНД ---

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  logger.logUser(msg.from);
  logger.logCommand(chatId, "start");

  bot.sendMessage(
    chatId,
    "👋 Добро пожаловать в 2d_decor studio!\n\nЯ помогу вам управлять событиями, задачами и финансами. Для быстрого доступа к приложению используйте команду /app.",
    {
      reply_markup: {
        keyboard: [
          ["💰 Добавить операцию"],
          ["📅 Мои события", "📝 Мои задачи"],
          ["🔗 Привязать аккаунт", "🚀 Открыть приложение"],
          ["❓ Помощь"],
        ],
        resize_keyboard: true,
      },
    }
  );
});

bot.onText(/\/add/, (msg) => handleAddStart(msg));

bot.onText(/\/(app|web_app)/, async (msg) => {
  const chatId = msg.chat.id;
  await logger.logCommand(chatId, "app");

  if (!webAppUrl) {
    logger.logError(chatId, new Error("WEBAPP_URL is not configured"), {
      command: "/app",
    });
    return bot.sendMessage(
      chatId,
      "К сожалению, адрес веб-приложения не настроен. Обратитесь к администратору."
    );
  }

  bot.sendMessage(
    chatId,
    "👇 Нажмите на кнопку ниже, чтобы открыть приложение.",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Открыть приложение", web_app: { url: getWebAppUrl() } }],
        ],
      },
    }
  );
});

bot.onText(/\/help/, (msg) => sendHelp(msg));

bot.onText(/\/link$/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Чтобы привязать аккаунт, нужен код. Получите его в настройках вашего профиля в веб-приложении, а затем отправьте мне команду в формате `/link КОД`.",
    { parse_mode: "Markdown" }
  );
});

bot.onText(/\/link (.+)/, (msg, match) =>
  handleLinkCommand(msg.chat.id, match[1])
);

bot.onText(/^[A-Z0-9]{6}$/, (msg) => {
  if (msg.text.startsWith("/")) return;
  handleLinkCommand(msg.chat.id, msg.text);
});

bot.onText(/\/login/, (msg) => {
  handleLoginRequest(msg.chat.id);
});

// --- ЕДИНЫЙ ОБРАБОТЧИК СООБЩЕНИЙ ---

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем команды, они обрабатываются выше
  if (text.startsWith("/")) return;

  const state = userDialogState[chatId];

  // Обработка кнопок главного меню
  switch (text) {
    case "💰 Добавить операцию":
      return handleAddStart(msg);
    case "🔗 Привязать аккаунт":
      return bot.emit("text", { ...msg, text: "/link" }); // Переиспользуем команду
    case "❓ Помощь":
      return sendHelp(msg);
    case "🚀 Открыть приложение":
      return bot.emit("text", { ...msg, text: "/app" }); // Переиспользуем команду
  }

  // Если нет состояния, выходим
  if (!state) return;

  // Обработка шагов диалога
  switch (state.step) {
    case "askForAmount":
      return handleAmount(chatId, text);
    case "askForNote":
      return handleNote(chatId, text);
  }
});

// --- ЕДИНЫЙ ОБРАБОТЧИК CALLBACK_QUERY ---

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const msg = query.message;

  const state = userDialogState[chatId];
  if (!state) {
    if (data === "cancel_dialog") {
      await bot.answerCallbackQuery(query.id);
      await bot
        .deleteMessage(chatId, msg.message_id)
        .catch((e) => logger.error(`Failed to delete message: ${e.message}`));
      return;
    }

    await bot.answerCallbackQuery(query.id, {
      text: "Диалог истек или не был начат.",
    });
    return;
  }

  await bot.answerCallbackQuery(query.id);
  await logger.logAction(chatId, "callback_query", { data });

  if (data === "cancel_dialog") {
    delete userDialogState[chatId];
    await bot.editMessageText("Действие отменено.", {
      chat_id: chatId,
      message_id: msg.message_id,
      reply_markup: null,
    });
    return;
  }

  switch (state.step) {
    case "askForType":
      if (data === "income" || data === "expense") {
        state.type = data;
        state.typeName = data === "income" ? "Доход" : "Расход";
        await askForEvent(chatId);
      }
      break;
    case "askForEvent":
      if (data.startsWith("event_")) {
        const eventId = data.split("_")[1];
        if (eventId === "null") {
          state.eventId = null;
          state.eventName = "Без мероприятия";
        } else {
          state.eventId = parseInt(eventId, 10);
          const button = msg.reply_markup.inline_keyboard
            .flat()
            .find((b) => b.callback_data === data);
          state.eventName = button
            ? button.text.replace(/^📅\s*/, "")
            : "Неизвестное мероприятие";
        }
        await askForAccount(chatId);
      }
      break;
    case "askForAccount":
      if (data.startsWith("account_")) {
        const accountId = data.split("_")[1];
        state.accountId = parseInt(accountId, 10);
        const button = msg.reply_markup.inline_keyboard
          .flat()
          .find((b) => b.callback_data === data);
        state.accountName = button
          ? button.text.replace(/^💳\s*/, "")
          : "Неизвестный счет";
        await askForCategory(chatId);
      }
      break;
    case "askForCategory":
      if (data.startsWith("category_")) {
        const categoryId = data.split("_")[1];
        state.categoryId = parseInt(categoryId, 10);
        const button = msg.reply_markup.inline_keyboard
          .flat()
          .find((b) => b.callback_data === data);
        state.categoryName = button
          ? button.text.replace(/^📁\s*/, "")
          : "Неизвестная категория";
        await askForAmount(chatId);
      }
      break;
    case "askForAmount":
      if (data === "skip_note") {
        state.note = null;
        await showConfirmation(chatId);
      }
      break;
    case "askForNote":
      if (data === "skip_note") {
        state.note = null;
        await showConfirmation(chatId);
      }
      break;
    case "confirm":
      if (data === "confirm_save") {
        await saveOperation(chatId);
      }
      break;
  }
});

// --- Функции диалога ---

async function startDialog(chatId) {
  await logger.logCommand(chatId, "start");

  const keyboard = [
    [{ text: "➕ Добавить операцию", callback_data: "add_operation" }],
    // More buttons can be added here for other commands
  ];

  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard,
    }),
  };

  await bot.sendMessage(
    chatId,
    "Добро пожаловать! 👋\n\nЯ помогу вам управлять вашими финансами и событиями. Выберите действие:",
    options
  );
}

async function handleAddStart(msg) {
  const chatId = msg.chat.id;
  await logger.logCommand(chatId, "add");

  userDialogState[chatId] = {
    step: "askForType",
    userId: msg.from.id,
  };
  logger.logAction(chatId, "dialog_start", { dialog: "add_operation" });

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "💵 Доход", callback_data: "income" },
          { text: "💳 Расход", callback_data: "expense" },
        ],
        [{ text: "❌ Отмена", callback_data: "cancel_dialog" }],
      ],
    },
  };

  await bot.sendMessage(chatId, "Выберите тип операции:", options);
}

async function askForEvent(chatId) {
  const state = userDialogState[chatId];
  if (!state) return;

  state.step = "askForEvent";
  logger.info(`[Dialog ${chatId}] Step -> askForEvent`);

  try {
    const { data: response } = await axios.get(
      `${apiUrl}/users/by-chat-id/${chatId}/events`
    );

    const events = response.data;
    const keyboard = [];

    if (events && events.length > 0) {
      events.forEach((event) => {
        const eventDate = new Date(event.date).toLocaleDateString("ru-RU");
        keyboard.push([
          {
            text: `📅 ${event.project_name} (${eventDate})`,
            callback_data: `event_${event.idevent}`,
          },
        ]);
      });
    }

    // Add the "No Event" and "Cancel" buttons
    keyboard.push([
      { text: "📎 Без мероприятия", callback_data: "event_null" },
    ]);
    keyboard.push([{ text: "❌ Отмена", callback_data: "cancel_dialog" }]);

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard,
      }),
    };

    bot.sendMessage(
      chatId,
      "К какому мероприятию относится операция?",
      options
    );
  } catch (error) {
    logger.error(`[Dialog ${chatId}] Failed to fetch events: ${error.message}`);
    bot.sendMessage(
      chatId,
      "Не удалось загрузить список мероприятий. Попробуйте позже."
    );
    delete userDialogState[chatId]; // End dialog on error
  }
}

async function askForAccount(chatId) {
  const state = userDialogState[chatId];
  if (!state) return;

  state.step = "askForAccount";
  logger.info(`[Dialog ${chatId}] Step -> askForAccount`);

  try {
    const { data: response } = await axios.get(`${apiUrl}/cashflow-accounts`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }, // Assuming protected route
    });

    const accounts = response.data;
    if (!accounts || accounts.length === 0) {
      bot.sendMessage(
        chatId,
        "Не найдено ни одного счета для проведения операций. Пожалуйста, добавьте их в системе."
      );
      delete userDialogState[chatId];
      return;
    }

    const keyboard = accounts.map((acc) => [
      {
        text: `💳 ${acc.name}`,
        callback_data: `account_${acc.idaccount_cashflow}`,
      },
    ]);
    keyboard.push([{ text: "❌ Отмена", callback_data: "cancel_dialog" }]);

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard,
      }),
    };

    bot.sendMessage(chatId, "С какого счета/кассы провести операцию?", options);
  } catch (error) {
    logger.error(
      `[Dialog ${chatId}] Failed to fetch cashflow accounts: ${error.message}`
    );
    bot.sendMessage(
      chatId,
      "Не удалось загрузить список счетов. Попробуйте позже."
    );
    delete userDialogState[chatId];
  }
}

async function askForCategory(chatId) {
  const state = userDialogState[chatId];
  if (!state) return;

  state.step = "askForCategory";
  logger.info(`[Dialog ${chatId}] Step -> askForCategory`);

  try {
    const { data: response } = await axios.get(
      `${apiUrl}/cashflow-categories`,
      {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }, // Assuming protected route
      }
    );

    const categories = response.data;
    if (!categories || categories.length === 0) {
      bot.sendMessage(
        chatId,
        "Не найдено ни одной категории. Пожалуйста, добавьте их в системе."
      );
      delete userDialogState[chatId];
      return;
    }

    const keyboard = categories.map((cat) => [
      {
        text: `📁 ${cat.name}`,
        callback_data: `category_${cat.idcategory_cashflow}`,
      },
    ]);
    keyboard.push([{ text: "❌ Отмена", callback_data: "cancel_dialog" }]);

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: keyboard,
      }),
    };

    bot.sendMessage(chatId, "Выберите категорию:", options);
  } catch (error) {
    logger.error(
      `[Dialog ${chatId}] Failed to fetch cashflow categories: ${error.message}`
    );
    bot.sendMessage(
      chatId,
      "Не удалось загрузить список категорий. Попробуйте позже."
    );
    delete userDialogState[chatId];
  }
}

async function askForAmount(chatId) {
  const state = userDialogState[chatId];
  if (!state) return;

  state.step = "askForAmount";
  logger.info(`[Dialog ${chatId}] Step -> askForAmount`);
  bot.sendMessage(
    chatId,
    `Введите сумму ${
      state.typeName === "Доход" ? "дохода" : "расхода"
    } в рублях:`
  );
}

async function handleAmount(chatId, text) {
  const state = userDialogState[chatId];
  const amount = parseFloat(text.replace(",", "."));
  if (isNaN(amount) || amount <= 0)
    return bot.sendMessage(
      chatId,
      "Неверная сумма. Пожалуйста, введите положительное число."
    );
  state.amount = amount;
  await askForNote(chatId);
}

async function askForNote(chatId) {
  const state = userDialogState[chatId];
  if (!state) return;

  state.step = "askForNote";
  logger.info(`[Dialog ${chatId}] Step -> askForNote`);
  bot.sendMessage(chatId, 'Добавьте комментарий или нажмите "Пропустить".', {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Пропустить", callback_data: "skip_note" }]],
    }),
  });
}

async function handleNote(chatId, text) {
  const state = userDialogState[chatId];
  state.note = text;
  await showConfirmation(chatId);
}

async function showConfirmation(chatId) {
  const state = userDialogState[chatId];
  if (!state) return;

  state.step = "confirm";
  logger.info(`[Dialog ${chatId}] Step -> confirm`);

  const confirmationText = `
Проверьте данные:
- **Тип:** ${state.typeName}
- **Сумма:** ${state.amount} руб.
- **Мероприятие:** ${state.eventName || "Не указано"}
- **Счет/Касса:** ${state.accountName || "Не указан"}
- **Категория:** ${state.categoryName || "Не указана"}
- **Комментарий:** ${state.note || "Нет"}

Всё верно?
  `.trim();

  const options = {
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "✅ Да, сохранить", callback_data: "confirm_save" },
          { text: "✏️ Начать заново", callback_data: "start_over" },
        ],
      ],
    }),
  };

  bot.sendMessage(chatId, confirmationText, options);
}

async function saveOperation(chatId) {
  const state = userDialogState[chatId];
  if (!state || !state.step === "confirm") return;

  const payload = {
    date: new Date().toISOString(),
    account_cashflow_idaccount_cashflow: state.accountId,
    category_cashflow_idcategory_cashflow: state.categoryId,
    event_idevent: state.eventId, // Can be null
    note: state.note,
    income: state.type === "income" ? state.amount : 0,
    expense: state.type === "expense" ? state.amount : 0,
  };

  logger.info(
    `[Dialog ${chatId}] Saving operation with payload: ${JSON.stringify(
      payload
    )}`
  );

  try {
    // We must use the admin token to perform this operation
    await axios.post(`${apiUrl}/cashflow`, payload, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });

    bot.sendMessage(chatId, "✅ Операция успешно сохранена!");
  } catch (error) {
    logger.error(
      `[Dialog ${chatId}] Failed to save operation: ${
        error.response ? JSON.stringify(error.response.data) : error.message
      }`
    );
    bot.sendMessage(
      chatId,
      "❌ Не удалось сохранить операцию. Попробуйте снова или обратитесь к администратору."
    );
  } finally {
    // Clean up state
    delete userDialogState[chatId];
  }
}

// --- Прочие функции ---

function sendHelp(msg) {
  logger.logCommand(msg.chat.id, "help");
  const helpText = `*Справка по командам*\n\n/start - Перезапустить бота\n/app - Открыть веб-приложение\n/add - Добавить доход/расход\n/link <КОД> - Привязать Telegram-аккаунт`;
  bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
}

async function handleLinkCommand(chatId, code) {
  await logger.logCommand(chatId, "link", { code });

  // Логируем URL для отладки
  console.log(
    `[Link] Attempting to connect to: ${apiUrl}/telegram/link-account`
  );
  console.log(`[Link] Sending data:`, { code, chat_id: chatId });

  try {
    const response = await axios.post(`${apiUrl}/telegram/link-account`, {
      code,
      chat_id: chatId,
    });
    console.log(`[Link] Success response:`, response.data);
    bot.sendMessage(
      chatId,
      "✅ Отлично! Ваш Telegram-аккаунт успешно привязан."
    );
  } catch (error) {
    console.log(`[Link] Error response:`, error.response?.data);
    console.log(`[Link] Error status:`, error.response?.status);

    let errorMessage = "Произошла неизвестная ошибка.";
    if (error.response) {
      switch (error.response.status) {
        case 404:
          errorMessage = "❌ Код не найден или срок его действия истек.";
          break;
        case 409:
          errorMessage = "❌ Этот Telegram-аккаунт уже привязан.";
          break;
        default:
          errorMessage = `❌ Ошибка сервера: ${
            error.response.data.message || "Не удалось завершить привязку."
          }`;
      }
    } else {
      errorMessage = "❌ Не удалось связаться с сервером.";
    }
    bot.sendMessage(chatId, errorMessage);
    logger.logError(chatId, error, { context: "handleLinkCommand" });
  }
}

const handleLoginRequest = async (chatId) => {
  logger.info(`[Login] User ${chatId} requested login link.`);
  try {
    // Проверяем, привязан ли пользователь
    const { data: response } = await axios.post(
      `${apiUrl}/telegram/generate-login-token`,
      { chatId }
    );

    if (response.success) {
      // Используем chat_id для автоматического входа
      const loginUrl = `https://decor-studio-app.onrender.com/login?tg_chat_id=${chatId}`;

      console.log(`[Login] Generated login URL: ${loginUrl}`);
      console.log(`[Login] chatId: ${chatId}`);

      const options = {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "Войти в веб-приложение", url: loginUrl }],
          ],
        }),
      };
      bot.sendMessage(
        chatId,
        "Нажмите кнопку ниже для автоматического входа в веб-приложение:",
        options
      );
    } else {
      throw new Error(response.message || "Failed to verify user.");
    }
  } catch (error) {
    logger.error(
      `[Login] Failed to generate login link for ${chatId}: ${error.message}`
    );

    // Добавляем подробное логирование ошибки
    if (error.response) {
      logger.error(`[Login] Response status: ${error.response.status}`);
      logger.error(
        `[Login] Response data: ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      logger.error(`[Login] No response received: ${error.request}`);
    } else {
      logger.error(`[Login] Error setting up request: ${error.message}`);
    }

    // Check if the error is because the user is not linked
    if (error.response && error.response.status === 404) {
      bot.sendMessage(
        chatId,
        "Ваш Telegram-аккаунт не привязан к профилю в системе. Пожалуйста, сначала войдите в веб-приложение и привяжите аккаунт в настройках."
      );
    } else {
      bot.sendMessage(
        chatId,
        "Не удалось создать ссылку для входа. Попробуйте снова позже."
      );
    }
  }
};

// --- BOT START ---
bot.setMyCommands([
  { command: "/start", description: "Начать работу с ботом" },
  { command: "/app", description: "Открыть веб-приложение" },
  { command: "/add", description: "Добавить доход или расход" },
  { command: "/link", description: "Привязать Telegram-аккаунт" },
  { command: "/login", description: "Быстрый вход в веб-приложение" },
]);

bot.on("polling_error", (error) => {
  logger.logError("system", error, { type: "polling_error" });
});

console.log("Бот запущен...");
