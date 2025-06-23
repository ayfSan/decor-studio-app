const TelegramBot = require("node-telegram-bot-api");
const logger = require("./logger.cjs");
const axios = require("axios");
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const apiUrl = process.env.API_URL || "http://localhost:3000/api";

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

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Логируем информацию о пользователе
  await logger.logUser(msg.from);
  // Логируем использование команды
  await logger.logCommand(chatId, "start");

  bot.sendMessage(
    chatId,
    "👋 Добро пожаловать в 2d_decor studio!\n\nЯ помогу вам управлять событиями, задачами и финансами. Для быстрого доступа к приложению используйте команду /app.",
    {
      reply_markup: {
        keyboard: [
          ["📅 События", "💰 Учет средств"],
          ["👥 Команда", "📝 Задачи"],
          ["⚙️ Настройки", "❓ Помощь"],
        ],
        resize_keyboard: true,
      },
    }
  );
});

// Команда /app для открытия веб-приложения
bot.onText(/\/(app|web_app)/, async (msg) => {
  const chatId = msg.chat.id;
  await logger.logCommand(chatId, "app");

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

// Команда /help и кнопка "Помощь"
bot.onText(/\/help/, sendHelp);
bot.on("message", async (msg) => {
  if (msg.text === "❓ Помощь") {
    await sendHelp(msg);
  }
});

async function sendHelp(msg) {
  const chatId = msg.chat.id;
  await logger.logCommand(chatId, "help");

  const helpText = `
📚 *Справка по использованию:*

*Быстрые команды на клавиатуре:*
📅 События - управление мероприятиями
💰 Учет средств - финансовый учет
👥 Команда - управление участниками
📝 Задачи - управление задачами
⚙️ Настройки - настройки приложения
❓ Помощь - эта справка

*Быстрое добавление финансов:*
Отправьте сообщение в формате:
#событие ДД.ММ.ГГГГ +/-СУММА описание

Например:
#свадьба 01.05.2024 -5000 Предоплата за зал

*Дополнительные команды:*
/app - открыть веб-приложение
/stats - показать вашу статистику
/start - перезапустить бота
/link <code> - привязать ваш Telegram к аккаунту в CRM
`;
  bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
}

// --- Логика привязки аккаунта ---

// 1. Обработка команды /link <code>
bot.onText(/\/link (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match[1]; // Код из сообщения
  await handleLinkCommand(chatId, code);
});

// 2. Обработка сообщений, которые могут быть кодом привязки
// Проверяем, что сообщение состоит из 6 символов (буквы и цифры)
bot.onText(/^[A-Z0-9]{6}$/, async (msg) => {
  // Исключаем обработку, если это была команда /link
  if (msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const code = msg.text;
  await handleLinkCommand(chatId, code);
});

// 3. Основная функция для привязки
async function handleLinkCommand(chatId, code) {
  await logger.logCommand(chatId, "link", { code });

  try {
    // Отправляем запрос на наш бэкенд для верификации кода
    const response = await axios.post(`${apiUrl}/telegram/link-account`, {
      code: code,
      chat_id: chatId,
    });

    if (response.data.success) {
      bot.sendMessage(
        chatId,
        "✅ Отлично! Ваш Telegram-аккаунт успешно привязан к профилю в CRM."
      );
      await logger.logInfo(
        `Account linked for chatId ${chatId} with code ${code}`
      );
    }
  } catch (error) {
    let errorMessage = "Произошла неизвестная ошибка.";
    if (error.response) {
      // Ошибки, которые вернул наш API
      switch (error.response.status) {
        case 404:
          errorMessage =
            "❌ Упс! Код не найден или срок его действия истек. Попробуйте получить новый код в настройках профиля.";
          break;
        case 409:
          errorMessage =
            "❌ Этот Telegram-аккаунт уже привязан к другому пользователю.";
          break;
        default:
          errorMessage = `❌ Ошибка сервера: ${
            error.response.data.message || "Не удалось завершить привязку."
          }`;
      }
    } else {
      // Сетевые или другие ошибки axios
      errorMessage = "❌ Не удалось связаться с сервером для проверки кода.";
    }

    bot.sendMessage(chatId, errorMessage);
    await logger.logError(
      `Failed to link account for chatId ${chatId}. Error: ${error.message}`
    );
  }
}

// --- Быстрое добавление финансов ---
const financeRegex =
  /^#(\S+)\s+(\d{2}\.\d{2}\.\d{4})\s+([+-]\d+(\.\d+)?)\s+(.*)$/i;

bot.onText(financeRegex, async (msg, match) => {
  const chatId = msg.chat.id;
  await logger.logCommand(chatId, "quick_finance_add", { message: msg.text });

  // 1. Проверить, привязан ли пользователь
  let user;
  try {
    const response = await axios.get(`${apiUrl}/users/by-chat-id/${chatId}`);
    user = response.data;
    if (!user) {
      bot.sendMessage(
        chatId,
        "❗️ Ваш Telegram не привязан к аккаунту. Используйте команду /link, чтобы привязать его."
      );
      return;
    }
  } catch (error) {
    bot.sendMessage(
      chatId,
      "❗️ Не удалось проверить вашу авторизацию. Пожалуйста, попробуйте позже."
    );
    await logger.logError(
      `Quick finance: Auth check failed for chatId ${chatId}. Error: ${error.message}`
    );
    return;
  }

  // 2. Распарсить данные из сообщения
  const [, eventName, eventDateStr, amountStr, description] = match;
  const amount = parseFloat(amountStr.replace(",", "."));
  const [day, month, year] = eventDateStr.split(".");
  // Формируем дату в формате ISO, чтобы избежать проблем с часовыми поясами на сервере
  const eventDate = new Date(Date.UTC(year, month - 1, day));

  try {
    // 3. Найти событие по имени и дате
    const eventResponse = await axios.post(`${apiUrl}/events/find`, {
      name: eventName,
      date: eventDate.toISOString().split("T")[0], // Отправляем YYYY-MM-DD
      userId: user.id, // Отправляем ID пользователя для точности поиска
    });

    const event = eventResponse.data;
    if (!event) {
      bot.sendMessage(
        chatId,
        `❓ Не удалось найти событие с названием "${eventName}" на дату ${eventDateStr}. Проверьте данные и попробуйте снова.`
      );
      return;
    }

    // 4. Создать транзакцию
    const cashflowPayload = {
      event_idevent: event.idevent,
      date: new Date().toISOString(), // Дата транзакции - текущая
      note: description,
      income: amount > 0 ? amount : 0,
      expense: amount < 0 ? Math.abs(amount) : 0,
      // Нужны значения по умолчанию или логика выбора для этих полей
      account_cashflow_idaccount_cashflow: 1, // TODO: Уточнить, как выбирать счет
      category_cashflow_idcategory_cashflow: 1, // TODO: Уточнить, как выбирать категорию
      transaction: `Быстрое добавление от ${user.name}`,
    };

    await axios.post(`${apiUrl}/cashflow`, cashflowPayload);

    // 5. Отправить подтверждение
    const sign = amount > 0 ? "+" : "";
    bot.sendMessage(
      chatId,
      `✅ Успешно добавлено: ${sign}${amount} руб. к событию "${event.name}" (${eventDateStr}).\nОписание: ${description}`
    );
    await logger.logInfo(
      `Quick finance: Added ${amount} for event ${event.idevent} by user ${user.id}`
    );
  } catch (error) {
    let errorMessage = "Произошла ошибка при добавлении финансов.";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = `❌ Ошибка: ${error.response.data.message}`;
    } else if (error.message.includes("404")) {
      errorMessage = `❓ Не удалось найти событие с названием "${eventName}" на дату ${eventDateStr}. Проверьте данные и попробуйте снова.`;
    }
    bot.sendMessage(chatId, errorMessage);
    await logger.logError(
      `Quick finance: Failed for chatId ${chatId}. Error: ${error.message}`
    );
  }
});

// Обработка кнопок клавиатуры
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Обработка кнопок основной клавиатуры
  switch (text) {
    case "📅 События":
      await logger.logCommand(chatId, "events_button");
      bot.sendMessage(
        chatId,
        "📅 *Управление событиями*\n\nВыберите действие:",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🎯 Открыть события",
                  web_app: { url: getWebAppUrl("/events") },
                },
              ],
              [
                {
                  text: "📊 Статистика событий",
                  callback_data: "events_stats",
                },
              ],
              [{ text: "📝 Создать событие", callback_data: "create_event" }],
            ],
          },
        }
      );
      break;

    case "💰 Учет средств":
      await logger.logCommand(chatId, "cash_button");
      bot.sendMessage(chatId, "💰 *Учет средств*\n\nВыберите действие:", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📊 Открыть учет",
                web_app: { url: getWebAppUrl("/cash") },
              },
            ],
            [
              {
                text: "💳 Добавить транзакцию",
                callback_data: "add_transaction",
              },
            ],
            [{ text: "📈 Финансовый отчет", callback_data: "finance_report" }],
          ],
        },
      });
      break;

    case "👥 Команда":
      await logger.logCommand(chatId, "team_button");
      bot.sendMessage(
        chatId,
        "👥 *Управление командой*\n\nВыберите действие:",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "👥 Открыть список",
                  web_app: { url: getWebAppUrl("/members") },
                },
              ],
              [{ text: "➕ Добавить участника", callback_data: "add_member" }],
              [{ text: "📊 Статистика команды", callback_data: "team_stats" }],
            ],
          },
        }
      );
      break;

    case "📝 Задачи":
      await logger.logCommand(chatId, "todo_button");
      bot.sendMessage(
        chatId,
        "📝 *Управление задачами*\n\nВыберите действие:",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📋 Открыть задачи",
                  web_app: { url: getWebAppUrl("/todo") },
                },
              ],
              [{ text: "➕ Добавить задачу", callback_data: "add_todo" }],
              [{ text: "📊 Прогресс", callback_data: "todo_progress" }],
            ],
          },
        }
      );
      break;

    case "⚙️ Настройки":
      await logger.logCommand(chatId, "settings_button");
      bot.sendMessage(chatId, "⚙️ *Настройки*\n\nВыберите действие:", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Открыть настройки",
                web_app: { url: getWebAppUrl("/settings") },
              },
            ],
            [{ text: "🔔 Уведомления", callback_data: "notifications" }],
            [{ text: "👤 Профиль", callback_data: "profile" }],
          ],
        },
      });
      break;
  }
});

// Обработка быстрого добавления финансов
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Проверяем формат сообщения: #событие дата сумма описание
  const match = text?.match(
    /^#(\w+)\s+(\d{2}\.\d{2}\.\d{4})\s+([+-]\d+)\s+(.+)$/
  );

  if (match) {
    const [, eventTag, date, amount, description] = match;

    try {
      const transaction = {
        eventTag,
        date,
        amount: parseInt(amount),
        description,
        timestamp: new Date(),
        chatId,
      };

      // Логируем транзакцию
      await logger.logTransaction(chatId, transaction);

      // Отправляем подробное подтверждение
      const amountText = amount.startsWith("+")
        ? `доход ${amount}`
        : `расход ${amount.substring(1)}`;
      const confirmationMessage = `
✅ *Транзакция успешно записана*

💰 Сумма: ${amountText} руб.
📅 Событие: #${eventTag}
📝 Описание: ${description}
📆 Дата: ${date}
⏱ Время записи: ${new Date().toLocaleTimeString()}

_Транзакция сохранена в системе и доступна в разделе "Учет средств"_
`;

      bot.sendMessage(chatId, confirmationMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📊 Открыть учет средств",
                web_app: { url: getWebAppUrl("/cash") },
              },
            ],
            [{ text: "💰 Добавить еще", callback_data: "add_transaction" }],
          ],
        },
      });
    } catch (error) {
      await logger.logError(chatId, error, {
        type: "transaction",
        data: { eventTag, date, amount, description },
      });
      console.error("Ошибка при сохранении транзакции:", error);
      bot.sendMessage(
        chatId,
        "❌ Произошла ошибка при сохранении транзакции. Пожалуйста, проверьте формат сообщения и попробуйте снова.\n\nФормат: #событие ДД.ММ.ГГГГ +/-СУММА описание"
      );
    }
  }
});

// Обработка callback_query для кнопок
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  await logger.logAction(chatId, "button_click", { button: action });

  // Отвечаем на все callback_query, чтобы убрать "часики" на кнопке
  bot.answerCallbackQuery(query.id);

  switch (action) {
    case "add_transaction":
      bot.sendMessage(
        chatId,
        "💰 *Добавление новой транзакции*\n\nОтправьте сообщение в формате:\n#событие ДД.ММ.ГГГГ +/-СУММА описание\n\nНапример:\n#свадьба 01.05.2024 -5000 Предоплата за зал",
        { parse_mode: "Markdown" }
      );
      break;
    // Здесь можно добавить обработку других callback_query
  }
});

// Отслеживание открытия веб-приложения
bot.on("web_app_data", async (msg) => {
  const chatId = msg.chat.id;
  await logger.logWebAppOpen(chatId, msg.web_app_data.data);
});

// Обработка ошибок
bot.on("polling_error", async (error) => {
  console.log(error);
  await logger.logError("system", error, { type: "polling_error" });
});

console.log("Бот запущен...");
