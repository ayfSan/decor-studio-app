const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL;

const bot = new TelegramBot(token, { polling: true });

// Обработка команд
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Добро пожаловать! Выберите действие:", {
    reply_markup: {
      keyboard: [
        ["📅 События", "💰 Учет средств"],
        ["👥 Команда", "📝 Задачи"],
      ],
      resize_keyboard: true,
    },
  });
});

bot.onText(/\/events/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Открываю управление событиями...", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Открыть события", web_app: { url: webAppUrl + "/events" } }],
      ],
    },
  });
});

// Обработка быстрого добавления финансов
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Проверяем формат сообщения: #событие дата сумма описание
  const match = text.match(
    /^#(\w+)\s+(\d{2}\.\d{2}\.\d{4})\s+([+-]\d+)\s+(.+)$/
  );

  if (match) {
    const [, eventTag, date, amount, description] = match;

    try {
      // Здесь будет логика сохранения в базу данных
      const transaction = {
        eventTag,
        date,
        amount: parseInt(amount),
        description,
        timestamp: new Date(),
        chatId,
      };

      // Временно выводим в консоль
      console.log("Новая транзакция:", transaction);

      // Отправляем подтверждение
      const amountText = amount.startsWith("+")
        ? `доход ${amount}`
        : `расход ${amount.substring(1)}`;
      bot.sendMessage(
        chatId,
        `✅ Записано: ${amountText} руб.\n📅 Событие: ${eventTag}\n📝 ${description}`
      );
    } catch (error) {
      console.error("Ошибка при сохранении транзакции:", error);
      bot.sendMessage(
        chatId,
        "❌ Произошла ошибка при сохранении. Попробуйте позже."
      );
    }
  }
});

// Запуск бота
bot.on("polling_error", (error) => {
  console.log(error);
});

console.log("Бот запущен...");
