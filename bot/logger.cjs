const fs = require("fs").promises;
const path = require("path");

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, "logs");
    this.usersFile = path.join(this.logsDir, "users.json");
    this.actionsFile = path.join(this.logsDir, "actions.json");
    this.users = new Map();
    this.actions = [];
    this.initFiles();
  }

  async initFiles() {
    try {
      // Создаем директорию для логов, если её нет
      await fs.mkdir(this.logsDir, { recursive: true });

      // Пытаемся прочитать существующие файлы
      try {
        const usersData = await fs.readFile(this.usersFile, "utf8");
        this.users = new Map(Object.entries(JSON.parse(usersData)));
      } catch (e) {
        await fs.writeFile(this.usersFile, "{}");
      }

      try {
        const actionsData = await fs.readFile(this.actionsFile, "utf8");
        this.actions = JSON.parse(actionsData);
      } catch (e) {
        await fs.writeFile(this.actionsFile, "[]");
      }
    } catch (error) {
      console.error("Error initializing logger:", error);
    }
  }

  async saveUsers() {
    try {
      const usersObject = Object.fromEntries(this.users);
      await fs.writeFile(this.usersFile, JSON.stringify(usersObject, null, 2));
    } catch (error) {
      console.error("Error saving users:", error);
    }
  }

  async saveActions() {
    try {
      await fs.writeFile(
        this.actionsFile,
        JSON.stringify(this.actions, null, 2)
      );
    } catch (error) {
      console.error("Error saving actions:", error);
    }
  }

  async logUser(user) {
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    };

    if (!this.users.has(user.id.toString())) {
      this.users.set(user.id.toString(), userData);
    } else {
      const existingUser = this.users.get(user.id.toString());
      this.users.set(user.id.toString(), {
        ...existingUser,
        last_seen: new Date().toISOString(),
      });
    }

    await this.saveUsers();
  }

  async logAction(userId, type, data = {}) {
    const action = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    this.actions.push(action);
    await this.saveActions();

    // Обновляем last_seen пользователя
    if (this.users.has(userId.toString())) {
      const user = this.users.get(userId.toString());
      user.last_seen = new Date().toISOString();
      await this.saveUsers();
    }

    return action;
  }

  // Методы для различных типов действий
  async logCommand(userId, command, args = {}) {
    return this.logAction(userId, "command", { command, args });
  }

  async logWebAppOpen(userId, path = "/") {
    return this.logAction(userId, "webapp_open", { path });
  }

  async logMessage(userId, messageType, messageData = {}) {
    return this.logAction(userId, "message", {
      type: messageType,
      ...messageData,
    });
  }

  async logTransaction(userId, transactionData) {
    return this.logAction(userId, "transaction", transactionData);
  }

  async logError(userId, error, context = {}) {
    return this.logAction(userId, "error", {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  // Добавляем стандартные методы логирования для совместимости
  info(message, ...args) {
    console.log(`[INFO] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  debug(message, ...args) {
    console.log(`[DEBUG] ${message}`, ...args);
  }

  // Методы для анализа
  async getUserStats(userId) {
    const userActions = this.actions.filter(
      (action) => action.userId === userId
    );
    return {
      totalActions: userActions.length,
      commandsUsed: userActions.filter((a) => a.type === "command").length,
      webAppOpens: userActions.filter((a) => a.type === "webapp_open").length,
      transactions: userActions.filter((a) => a.type === "transaction").length,
      lastAction: userActions[userActions.length - 1],
      firstAction: userActions[0],
    };
  }

  async getActiveUsers(days = 7) {
    const now = new Date();
    const activeUsers = Array.from(this.users.values()).filter((user) => {
      const lastSeen = new Date(user.last_seen);
      const diffTime = Math.abs(now - lastSeen);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= days;
    });
    return activeUsers;
  }
}

module.exports = new Logger();
