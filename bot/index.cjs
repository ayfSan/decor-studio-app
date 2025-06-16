const TelegramBot = require("node-telegram-bot-api");
const logger = require("./logger.cjs");
const axios = require("axios");
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;
const apiUrl = process.env.API_URL || "http://localhost:3000/api";

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
    "👋 Добро пожаловать в Decor Studio!\n\nЯ помогу вам управлять событиями, задачами и финансами. Выберите нужный раздел:",
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
