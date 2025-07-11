import express from "express";
import cors from "cors";
import pool from "./api/database.js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

dotenv.config();

const saltRounds = 10;

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Настройка CORS
const allowedOrigins = [
  "http://localhost:5173", // Для локальной разработки
  "https://ayfsan.github.io", // Ваш домен на GitHub Pages
];

const corsOptions = {
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, от Postman или мобильных приложений)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Разрешаем передачу cookies и заголовков авторизации
};

app.use(cors(corsOptions));
app.use(express.json());

// --- AUTHENTICATION ---

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  console.log(`\n--- [AUTH] Authenticating request for: ${req.path} ---`);
  const authHeader = req.headers["authorization"];
  console.log(`[AUTH] Authorization header: ${authHeader}`);

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("[AUTH] Failed: No token provided.");
    return res.sendStatus(401); // if there isn't any token
  }

  console.log(`[AUTH] Token received: ${token}`);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("[AUTH] Failed: Token verification error.", err.message);
      return res.sendStatus(403);
    }
    console.log("[AUTH] Success: Token verified.");
    req.user = user;
    next();
  });
};

// Middleware to authorize based on roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res
        .status(403)
        .json({ success: false, message: "User data is missing in token" });
    }
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have the required role.",
      });
    }
    next();
  };
};

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  console.log("\n--- [DEBUG] New Login Attempt ---");
  const { username, password } = req.body;

  if (!username || !password) {
    console.log("[DEBUG] Login failed: Username or password not provided.");
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required" });
  }

  console.log(`[DEBUG] Received username: ${username}`);
  console.log(`[DEBUG] Received password: ${password}`);

  try {
    const [users] = await pool.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      console.log(
        `[DEBUG] Login failed: User '${username}' not found in database.`
      );
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const user = users[0];
    console.log(
      `[DEBUG] User found in DB. Stored password hash: ${user.password}`
    );

    const match = await bcrypt.compare(password, user.password);
    console.log(`[DEBUG] bcrypt.compare result: ${match}`);

    if (!match) {
      console.log("[DEBUG] Login failed: Passwords do not match.");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    console.log("[DEBUG] Login successful! Generating token...");
    const [roles] = await pool.query(
      "SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?",
      [user.id]
    );
    const userRoles = roles.map((r) => r.name);

    const userPayload = {
      id: user.id,
      username: user.username,
      roles: userRoles,
      telegram_chat_id: user.telegram_chat_id,
    };

    const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, {
      expiresIn: "8h", // Увеличим время жизни токена
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: userRoles,
        telegram_chat_id: user.telegram_chat_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
    console.error("[DEBUG] Server error during login:", error);
  }
});

// Login with Telegram token endpoint
app.post("/api/auth/login-telegram", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    // Find user by token
    const [users] = await pool.query(
      "SELECT * FROM user WHERE temp_token = ? AND temp_token_type = 'login' AND temp_token_expires_at > UTC_TIMESTAMP()",
      [token]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = users[0];

    // Get user roles
    const [roles] = await pool.query(
      "SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?",
      [user.id]
    );
    const userRoles = roles.map((r) => r.name);

    // Clear the token after successful use
    await pool.query(
      "UPDATE user SET temp_token = NULL, temp_token_expires_at = NULL, temp_token_type = NULL WHERE id = ?",
      [user.id]
    );

    const userPayload = {
      id: user.id,
      username: user.username,
      roles: userRoles,
      telegram_chat_id: user.telegram_chat_id,
    };

    const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: userRoles,
        telegram_chat_id: user.telegram_chat_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.telegram_chat_id, 
              JSON_ARRAYAGG(r.name) as roles
       FROM user u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Роли могут быть [null], если у пользователя нет ролей. Очистим это.
    if (
      users[0].roles &&
      users[0].roles.length === 1 &&
      users[0].roles[0] === null
    ) {
      users[0].roles = [];
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error("Failed to fetch user data for /me:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// --- TELEGRAM LINKING ---

// Endpoint for web-app to generate a linking code for the logged-in user
app.post(
  "/api/users/me/generate-link-code",
  authenticateToken,
  async (req, res) => {
    const userId = req.user.id;
    try {
      const code = randomBytes(3).toString("hex").toUpperCase(); // e.g., A4F9B1
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // Code expires in 10 minutes

      console.log(`[GenerateCode] Generating code for user ${userId}: ${code}`);
      console.log(`[GenerateCode] Current time: ${now.toISOString()}`);
      console.log(`[GenerateCode] Expires at: ${expiresAt.toISOString()}`);

      // Используем MySQL формат времени
      const mysqlExpiresAt = expiresAt
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await pool.query(
        "UPDATE user SET temp_token = ?, temp_token_expires_at = ?, temp_token_type = 'link' WHERE id = ?",
        [code, mysqlExpiresAt, userId]
      );

      console.log(`[GenerateCode] Code saved successfully for user ${userId}`);

      res.json({ success: true, code });
    } catch (error) {
      console.log(`[GenerateCode] Error:`, error.message);
      res.status(500).json({
        success: false,
        message: "Failed to generate link code",
        error: error.message,
      });
    }
  }
);

// Get events for the currently authenticated user
app.get("/api/users/me/events", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [events] = await pool.query(
      `
      SELECT e.*
      FROM event e
      JOIN event_user eu ON e.idevent = eu.event_idevent
      WHERE eu.user_id = ?
      ORDER BY e.date ASC
    `,
      [userId]
    );
    res.json({ success: true, data: events });
  } catch (error) {
    console.error("Failed to fetch user events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user events.",
      error: error.message,
    });
  }
});

// Get all users
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.username, 
        u.first_name, 
        u.last_name, 
        u.telegram_chat_id, 
        u.created_at,
        CASE r.name
          WHEN 'admin' THEN 'Администратор'
          WHEN 'manager' THEN 'Менеджер'
          WHEN 'user' THEN 'Сотрудник'
          ELSE 'Неизвестная роль'
        END as role
      FROM user u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.created_at DESC`
    );
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Endpoint for Telegram bot to link a chat_id to a user account
// В реальном приложении этот эндпоинт нужно защитить (например, секретным токеном бота)
app.post("/api/telegram/link-account", async (req, res) => {
  const { code, chat_id } = req.body;
  console.log(`[Link] Received request:`, { code, chat_id });

  if (!code || !chat_id) {
    console.log(`[Link] Missing required fields`);
    return res
      .status(400)
      .json({ success: false, message: "Code and chat_id are required" });
  }

  try {
    console.log(`[Link] Searching for user with code: ${code}`);
    console.log(`[Link] Current time: ${new Date().toISOString()}`);

    // Сначала проверим, есть ли пользователь с таким кодом вообще
    const [allUsers] = await pool.query(
      "SELECT id, username, temp_token, temp_token_type, temp_token_expires_at FROM user WHERE temp_token = ?",
      [code]
    );
    console.log(`[Link] All users with this code:`, allUsers);

    if (allUsers.length > 0) {
      const user = allUsers[0];
      const now = new Date();
      const expiresAt = new Date(user.temp_token_expires_at);
      console.log(
        `[Link] Time check: now=${now.toISOString()}, expires=${expiresAt.toISOString()}, isExpired=${
          now > expiresAt
        }`
      );
    }

    const [users] = await pool.query(
      "SELECT * FROM user WHERE temp_token = ? AND temp_token_type = 'link' AND temp_token_expires_at > UTC_TIMESTAMP()",
      [code]
    );

    console.log(`[Link] Found users:`, users.length);
    if (users.length > 0) {
      console.log(`[Link] User found:`, {
        id: users[0].id,
        username: users[0].username,
      });
    }

    if (users.length === 0) {
      console.log(`[Link] No valid user found for code: ${code}`);
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired code" });
    }
    const user = users[0];

    console.log(`[Link] Linking chat_id ${chat_id} to user ${user.id}`);
    await pool.query(
      "UPDATE user SET telegram_chat_id = ?, temp_token = NULL, temp_token_expires_at = NULL, temp_token_type = NULL WHERE id = ?",
      [chat_id, user.id]
    );

    console.log(`[Link] Successfully linked account`);
    res.json({ success: true, message: "Account linked successfully" });
  } catch (error) {
    console.log(`[Link] Error:`, error.message);
    // Обработка случая, если chat_id уже занят (сработает UNIQUE constraint)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This Telegram account is already linked to another user.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to link account",
      error: error.message,
    });
  }
});

// Endpoint for Telegram bot to generate login token for linked user
app.post("/api/telegram/generate-login-token", async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res
      .status(400)
      .json({ success: false, message: "chatId is required" });
  }

  try {
    // Find user by chat_id
    const [users] = await pool.query(
      "SELECT id FROM user WHERE telegram_chat_id = ?",
      [chatId]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found for this chat_id" });
    }

    const userId = users[0].id;
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Используем MySQL формат времени
    const mysqlExpiresAt = expiresAt
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Store the token
    await pool.query(
      "UPDATE user SET temp_token = ?, temp_token_expires_at = ?, temp_token_type = 'login' WHERE id = ?",
      [token, mysqlExpiresAt, userId]
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate login token",
      error: error.message,
    });
  }
});

// Endpoint to get events for a specific user via their chat_id
// This should be protected by a secret token from the bot
app.get("/api/users/by-chat-id/:chatId/events", async (req, res) => {
  const { chatId } = req.params;
  // TODO: Add bot token validation
  // const botToken = req.headers['bot-token'];
  // if (botToken !== process.env.BOT_INTERNAL_TOKEN) {
  //   return res.status(401).json({ success: false, message: "Unauthorized" });
  // }

  try {
    // 1. Find user by chat_id
    const [users] = await pool.query(
      "SELECT id FROM user WHERE telegram_chat_id = ?",
      [chatId]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found for this chat_id" });
    }
    const userId = users[0].id;

    // 2. Find events linked to this user
    // We get the 5 most recent upcoming events
    const [events] = await pool.query(
      `SELECT e.idevent, e.project_name, e.date
       FROM event e
       JOIN event_user eu ON e.idevent = eu.event_idevent
       WHERE eu.user_id = ? AND e.date >= CURDATE()
       ORDER BY e.date ASC
       LIMIT 5`,
      [userId]
    );

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching user events",
      error: error.message,
    });
  }
});

// --- TEST & CORE ---
app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    res.json({
      success: true,
      message: "API is working",
      db_solution: rows[0].solution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "API is not working",
      error: error.message,
    });
  }
});

// --- API РОУТЕР С АУТЕНТИФИКАЦИЕЙ ---

// Создаем отдельный роутер для защищенных эндпоинтов
const apiRouter = express.Router();

// --- ОТКРЫТЫЕ ЭНДПОИНТЫ ДЛЯ TELEGRAM-БОТА (БЕЗ АВТОРИЗАЦИИ) ---
apiRouter.get("/telegram/cashflow-accounts", async (req, res) => {
  try {
    const [accounts] = await pool.query(
      "SELECT * FROM account_cashflow ORDER BY name"
    );
    res.json({ success: true, data: accounts });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

apiRouter.get("/telegram/cashflow-categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM category_cashflow ORDER BY name"
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

apiRouter.get("/telegram/events", async (req, res) => {
  try {
    const [events] = await pool.query(
      "SELECT idevent, project_name, date FROM event ORDER BY date DESC LIMIT 20"
    );
    res.json({ success: true, data: events });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

apiRouter.post("/telegram/add-cashflow", async (req, res) => {
  const { chatId, operation } = req.body;
  if (!chatId || !operation) {
    return res
      .status(400)
      .json({ success: false, message: "chatId and operation are required" });
  }
  try {
    const [users] = await pool.query(
      "SELECT id FROM user WHERE telegram_chat_id = ?",
      [chatId]
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found for this chat_id" });
    }
    const userId = users[0].id;
    const [result] = await pool.query(
      `INSERT INTO cashflow (
        date, transaction, account_cashflow_idaccount_cashflow, 
        category_cashflow_idcategory_cashflow, event_idevent, note, income, expense
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.date,
        operation.transaction || "",
        operation.account_cashflow_idaccount_cashflow,
        operation.category_cashflow_idcategory_cashflow,
        operation.event_idevent || null,
        operation.note || "",
        operation.income || 0,
        operation.expense || 0,
      ]
    );
    res.json({
      success: true,
      message: "Operation added successfully",
      data: { id: result.insertId },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Применяем middleware для проверки токена ко всем остальным маршрутам этого роутера
apiRouter.use(authenticateToken);

// --- HOME PAGE ---
apiRouter.get("/statistics", async (req, res) => {
  try {
    console.log("\n--- [DATA] Fetching data for /api/statistics ---");
    const [activeEvents] = await pool.query(
      "SELECT COUNT(*) as count FROM event WHERE date >= CURDATE()"
    );
    const [usersCount] = await pool.query("SELECT COUNT(*) as count FROM user");
    const [contactsCount] = await pool.query(
      "SELECT COUNT(*) as count FROM contact"
    );
    const [completedThisMonth] = await pool.query(
      "SELECT COUNT(*) as count FROM event WHERE date < CURDATE() AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())"
    );

    const responseData = {
      activeEvents: activeEvents[0].count,
      teamMembers: usersCount[0].count + contactsCount[0].count,
      completedThisMonth: completedThisMonth[0].count,
    };

    console.log("[DATA] Data to be sent:", responseData);

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[DATA] Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

apiRouter.get("/events/upcoming", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idevent, project_name, date FROM event WHERE date >= CURDATE() ORDER BY date ASC LIMIT 5"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
      error: error.message,
    });
  }
});

// --- EVENTS ---
apiRouter.get("/events", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM event ORDER BY date DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

apiRouter.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [eventRows] = await pool.query(
      "SELECT * FROM event WHERE idevent = ?",
      [id]
    );
    if (eventRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const event = eventRows[0];

    const [userRows] = await pool.query(
      "SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, 'user' as type FROM event_user eu JOIN user u ON eu.user_id = u.id WHERE eu.event_idevent = ?",
      [id]
    );
    const [contactRows] = await pool.query(
      "SELECT c.idcontact as id, c.name, 'contact' as type FROM event_contact ec JOIN contact c ON ec.contact_idcontact = c.idcontact WHERE ec.event_idevent = ?",
      [id]
    );

    event.participants = [
      ...userRows.map((u) => ({ ...u, uniqueId: `user-${u.id}` })),
      ...contactRows.map((c) => ({ ...c, uniqueId: `contact-${c.id}` })),
    ];

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
      error: error.message,
    });
  }
});

apiRouter.post("/events", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      date,
      project_name,
      category_event_idcategory_event,
      venue_idvenue,
      customer_idcustomer,
      cost,
      participants = [],
    } = req.body;
    await connection.beginTransaction();
    const eventSql =
      "INSERT INTO event (date, project_name, category_event_idcategory_event, venue_idvenue, customer_idcustomer, cost) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await connection.query(eventSql, [
      date,
      project_name,
      category_event_idcategory_event,
      venue_idvenue,
      customer_idcustomer,
      cost,
    ]);
    const eventId = result.insertId;

    if (participants.length > 0) {
      const userParticipants = participants
        .filter((p) => p.uniqueId.startsWith("user-"))
        .map((p) => [eventId, p.uniqueId.split("-")[1]]);
      const contactParticipants = participants
        .filter((p) => p.uniqueId.startsWith("contact-"))
        .map((p) => [eventId, p.uniqueId.split("-")[1]]);
      if (userParticipants.length > 0) {
        await connection.query(
          "INSERT INTO event_user (event_idevent, user_id) VALUES ?",
          [userParticipants]
        );
      }
      if (contactParticipants.length > 0) {
        await connection.query(
          "INSERT INTO event_contact (event_idevent, contact_idcontact) VALUES ?",
          [contactParticipants]
        );
      }
    }
    await connection.commit();
    res.status(201).json({ success: true, data: { id: eventId, ...req.body } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
});

apiRouter.put("/events/:id", async (req, res) => {
  const eventId = req.params.id;
  const { participants = [], ...eventData } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const {
      date,
      project_name,
      category_event_idcategory_event,
      venue_idvenue,
      customer_idcustomer,
      cost,
    } = eventData;
    const eventUpdateQuery =
      "UPDATE event SET date = ?, project_name = ?, category_event_idcategory_event = ?, venue_idvenue = ?, customer_idcustomer = ?, cost = ? WHERE idevent = ?";
    await connection.query(eventUpdateQuery, [
      date,
      project_name,
      category_event_idcategory_event,
      venue_idvenue,
      customer_idcustomer,
      cost,
      eventId,
    ]);

    await connection.query("DELETE FROM event_user WHERE event_idevent = ?", [
      eventId,
    ]);
    await connection.query(
      "DELETE FROM event_contact WHERE event_idevent = ?",
      [eventId]
    );

    const userParticipants = participants
      .filter((p) => p.uniqueId.startsWith("user-"))
      .map((p) => [eventId, p.uniqueId.split("-")[1]]);
    const contactParticipants = participants
      .filter((p) => p.uniqueId.startsWith("contact-"))
      .map((p) => [eventId, p.uniqueId.split("-")[1]]);

    if (userParticipants.length > 0) {
      await connection.query(
        "INSERT INTO event_user (event_idevent, user_id) VALUES ?",
        [userParticipants]
      );
    }
    if (contactParticipants.length > 0) {
      await connection.query(
        "INSERT INTO event_contact (event_idevent, contact_idcontact) VALUES ?",
        [contactParticipants]
      );
    }
    await connection.commit();
    res.json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
});

apiRouter.delete("/events/:id", async (req, res) => {
  const eventId = req.params.id;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM task WHERE event_idevent = ?", [
      eventId,
    ]);
    await connection.query("DELETE FROM document WHERE event_idevent = ?", [
      eventId,
    ]);
    await connection.query("DELETE FROM cashflow WHERE event_idevent = ?", [
      eventId,
    ]);
    await connection.query("DELETE FROM event_user WHERE event_idevent = ?", [
      eventId,
    ]);
    await connection.query(
      "DELETE FROM event_contact WHERE event_idevent = ?",
      [eventId]
    );
    await connection.query("DELETE FROM event WHERE idevent = ?", [eventId]);
    await connection.commit();
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
});

// --- EVENT CATEGORIES ---
apiRouter.get("/event-categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM category_event ORDER BY name"
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event categories",
      error: error.message,
    });
  }
});

apiRouter.post("/event-categories", async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO category_event (name) VALUES (?)",
      [name]
    );
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, name } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create event category",
      error: error.message,
    });
  }
});

apiRouter.put("/event-categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.query(
      "UPDATE category_event SET name = ? WHERE idcategory_event = ?",
      [name, id]
    );
    res.json({ success: true, data: { id, name } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update event category",
      error: error.message,
    });
  }
});

apiRouter.delete("/event-categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM category_event WHERE idcategory_event = ?", [
      id,
    ]);
    res.json({ success: true, message: "Event category deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event category",
      error: error.message,
    });
  }
});

// --- VENUES ---
apiRouter.get("/venues", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM venue ORDER BY name_venue");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch venues",
      error: error.message,
    });
  }
});

apiRouter.post("/venues", async (req, res) => {
  const { name_venue, address, contact_person, phone, notes } = req.body;
  try {
    const sql =
      "INSERT INTO venue (name_venue, address, contact_person, phone, notes) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      name_venue,
      address,
      contact_person,
      phone,
      notes,
    ]);
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create venue",
      error: error.message,
    });
  }
});

apiRouter.put("/venues/:id", async (req, res) => {
  const { id } = req.params;
  const { name_venue, address, contact_person, phone, notes } = req.body;
  try {
    const sql =
      "UPDATE venue SET name_venue = ?, address = ?, contact_person = ?, phone = ?, notes = ? WHERE idvenue = ?";
    await pool.query(sql, [
      name_venue,
      address,
      contact_person,
      phone,
      notes,
      id,
    ]);
    res.json({ success: true, data: { id, ...req.body } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update venue",
      error: error.message,
    });
  }
});

apiRouter.delete("/venues/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM venue WHERE idvenue = ?", [id]);
    res.json({ success: true, message: "Venue deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete venue",
      error: error.message,
    });
  }
});

// --- CUSTOMERS ---
apiRouter.get("/customers", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customer ORDER BY name_customer"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

apiRouter.post("/customers", async (req, res) => {
  const { name_customer, contact_person, phone, telegram_username, notes } =
    req.body;
  try {
    const sql =
      "INSERT INTO customer (name_customer, contact_person, phone, telegram_username, notes) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      name_customer,
      contact_person,
      phone,
      telegram_username,
      notes,
    ]);
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
});

apiRouter.put("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const { name_customer, contact_person, phone, telegram_username, notes } =
    req.body;
  try {
    const sql =
      "UPDATE customer SET name_customer = ?, contact_person = ?, phone = ?, telegram_username = ?, notes = ? WHERE idcustomer = ?";
    await pool.query(sql, [
      name_customer,
      contact_person,
      phone,
      telegram_username,
      notes,
      id,
    ]);
    res.json({ success: true, data: { id, ...req.body } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
});

apiRouter.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM customer WHERE idcustomer = ?", [id]);
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
      error: error.message,
    });
  }
});

// --- USERS ---
apiRouter.get("/users", authorizeRoles("admin"), async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at,
        u.telegram_chat_id AS telegram_id,
        CASE r.name
          WHEN 'admin' THEN 'Администратор'
          WHEN 'manager' THEN 'Менеджер'
          WHEN 'user' THEN 'Сотрудник'
          ELSE 'Неизвестная роль'
        END AS role
      FROM
        user u
      LEFT JOIN
        user_roles ur ON u.id = ur.user_id
      LEFT JOIN
        roles r ON ur.role_id = r.id
      ORDER BY
        u.first_name, u.last_name
    `);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

apiRouter.post("/users", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { telegram_id, username, first_name, last_name, role, password } =
      req.body;

    // Используем предоставленный пароль или генерируем случайный, если пароль не указан.
    const passwordToHash = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(passwordToHash, saltRounds);

    const userSql =
      "INSERT INTO user (username, first_name, last_name, telegram_chat_id, password) VALUES (?, ?, ?, ?, ?)";
    const [userResult] = await connection.query(userSql, [
      username,
      first_name,
      last_name,
      telegram_id,
      hashedPassword,
    ]);
    const newUserId = userResult.insertId;

    let roleName;
    switch (role) {
      case "Администратор":
        roleName = "admin";
        break;
      case "Менеджер":
        roleName = "manager";
        break;
      default:
        roleName = "user";
    }

    const [roleRows] = await connection.query(
      "SELECT id FROM roles WHERE name = ?",
      [roleName]
    );
    if (roleRows.length === 0) {
      throw new Error(`Role '${roleName}' not found.`);
    }
    const roleId = roleRows[0].id;

    const userRoleSql =
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
    await connection.query(userRoleSql, [newUserId, roleId]);

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: newUserId, ...req.body },
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

apiRouter.put("/users/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { telegram_id, username, first_name, last_name, role, password } =
      req.body;

    // Динамически строим запрос на обновление, чтобы обновлять только переданные поля.
    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (first_name) fieldsToUpdate.first_name = first_name;
    if (last_name) fieldsToUpdate.last_name = last_name;
    if (telegram_id) fieldsToUpdate.telegram_chat_id = telegram_id;

    // Если передан новый пароль, хешируем и добавляем его в объект для обновления.
    if (password) {
      fieldsToUpdate.password = await bcrypt.hash(password, saltRounds);
    }

    const userFields = Object.keys(fieldsToUpdate)
      .map((key) => `${key} = ?`)
      .join(", ");
    const userValues = Object.values(fieldsToUpdate);

    if (userFields.length > 0) {
      const userSql = `UPDATE user SET ${userFields} WHERE id = ?`;
      await connection.query(userSql, [...userValues, id]);
    }

    if (role) {
      let roleName;
      switch (role) {
        case "Администратор":
          roleName = "admin";
          break;
        case "Менеджер":
          roleName = "manager";
          break;
        case "Сотрудник":
          roleName = "user";
          break;
        default:
          throw new Error("Invalid role specified");
      }

      const [roleRows] = await connection.query(
        "SELECT id FROM roles WHERE name = ?",
        [roleName]
      );
      if (roleRows.length === 0) {
        throw new Error(`Role '${roleName}' not found.`);
      }
      const roleId = roleRows[0].id;

      const userRoleSql = "UPDATE user_roles SET role_id = ? WHERE user_id = ?";
      const [updateResult] = await connection.query(userRoleSql, [roleId, id]);

      if (updateResult.affectedRows === 0) {
        await connection.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [id, roleId]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, data: { id, ...req.body } });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: `Failed to update user: ${error.message}`,
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

apiRouter.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM user WHERE id = ?", [id]);
  res.json({ success: true, message: "User deleted" });
});

// --- CONTACTS ---
apiRouter.get("/contacts", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contact");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message,
    });
  }
});

apiRouter.post("/contacts", async (req, res) => {
  const { name, specialty, phone, notes } = req.body;
  const sql =
    "INSERT INTO contact (name, specialty, phone, notes) VALUES (?, ?, ?, ?)";
  const [result] = await pool.query(sql, [name, specialty, phone, notes]);
  res
    .status(201)
    .json({ success: true, data: { id: result.insertId, ...req.body } });
});

apiRouter.put("/contacts/:id", async (req, res) => {
  const { id } = req.params;
  const { name, specialty, phone, notes } = req.body;
  const sql =
    "UPDATE contact SET name = ?, specialty = ?, phone = ?, notes = ? WHERE idcontact = ?";
  await pool.query(sql, [name, specialty, phone, notes, id]);
  res.json({ success: true, data: { id, ...req.body } });
});

apiRouter.delete("/contacts/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM contact WHERE idcontact = ?", [id]);
  res.json({ success: true, message: "Contact deleted" });
});

// --- CASHFLOW ---
apiRouter.get("/cashflow", async (req, res) => {
  const { eventId } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT cf.*, e.project_name, acc.name as account_name, cat.name as category_name
      FROM cashflow cf
      LEFT JOIN event e ON cf.event_idevent = e.idevent
      LEFT JOIN account_cashflow acc ON cf.account_cashflow_idaccount_cashflow = acc.idaccount_cashflow
      LEFT JOIN category_cashflow cat ON cf.category_cashflow_idcategory_cashflow = cat.idcategory_cashflow
      ORDER BY cf.date DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cashflow records",
      error: error.message,
    });
  }
});

apiRouter.post("/cashflow", async (req, res) => {
  const {
    date,
    transaction,
    account_cashflow_idaccount_cashflow,
    category_cashflow_idcategory_cashflow,
    event_idevent,
    note,
    income,
    expense,
  } = req.body;
  const sql =
    "INSERT INTO cashflow (date, transaction, account_cashflow_idaccount_cashflow, category_cashflow_idcategory_cashflow, event_idevent, note, income, expense) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const [result] = await pool.query(sql, [
    date,
    transaction,
    account_cashflow_idaccount_cashflow,
    category_cashflow_idcategory_cashflow,
    event_idevent,
    note,
    income || 0,
    expense || 0,
  ]);
  res
    .status(201)
    .json({ success: true, data: { id: result.insertId, ...req.body } });
});

apiRouter.put("/cashflow/:id", async (req, res) => {
  const { id } = req.params;
  const {
    date,
    transaction,
    account_cashflow_idaccount_cashflow,
    category_cashflow_idcategory_cashflow,
    event_idevent,
    note,
    income,
    expense,
  } = req.body;
  const sql =
    "UPDATE cashflow SET date = ?, transaction = ?, account_cashflow_idaccount_cashflow = ?, category_cashflow_idcategory_cashflow = ?, event_idevent = ?, note = ?, income = ?, expense = ? WHERE idcashflow = ?";
  await pool.query(sql, [
    date,
    transaction,
    account_cashflow_idaccount_cashflow,
    category_cashflow_idcategory_cashflow,
    event_idevent,
    note,
    income,
    expense,
    id,
  ]);
  res.json({ success: true, data: { id, ...req.body } });
});

apiRouter.delete("/cashflow/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM cashflow WHERE idcashflow = ?", [id]);
  res.json({ success: true, message: "Cashflow record deleted" });
});

// --- CASHFLOW ACCOUNTS ---
apiRouter.get("/cashflow-accounts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM account_cashflow ORDER BY name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cashflow accounts",
      error: error.message,
    });
  }
});

apiRouter.post("/cashflow-accounts", async (req, res) => {
  const { name } = req.body;
  const [result] = await pool.query(
    "INSERT INTO account_cashflow (name) VALUES (?)",
    [name]
  );
  res.status(201).json({ success: true, data: { id: result.insertId, name } });
});

apiRouter.put("/cashflow-accounts/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await pool.query(
    "UPDATE account_cashflow SET name = ? WHERE idaccount_cashflow = ?",
    [name, id]
  );
  res.json({ success: true, data: { id, name } });
});

apiRouter.delete("/cashflow-accounts/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    "DELETE FROM account_cashflow WHERE idaccount_cashflow = ?",
    [id]
  );
  res.json({ success: true, message: "Account deleted" });
});

// --- CASHFLOW CATEGORIES ---
apiRouter.get("/cashflow-categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM category_cashflow ORDER BY name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cashflow categories",
      error: error.message,
    });
  }
});

apiRouter.post("/cashflow-categories", async (req, res) => {
  const { name } = req.body;
  const [result] = await pool.query(
    "INSERT INTO category_cashflow (name) VALUES (?)",
    [name]
  );
  res.status(201).json({ success: true, data: { id: result.insertId, name } });
});

apiRouter.put("/cashflow-categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await pool.query(
    "UPDATE category_cashflow SET name = ? WHERE idcategory_cashflow = ?",
    [name, id]
  );
  res.json({ success: true, data: { id, name } });
});

apiRouter.delete("/cashflow-categories/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    "DELETE FROM category_cashflow WHERE idcategory_cashflow = ?",
    [id]
  );
  res.json({ success: true, message: "Cashflow category deleted" });
});

// --- TASKS ---
apiRouter.get("/events/:eventId/tasks", async (req, res) => {
  const { eventId } = req.params;
  const [tasks] = await pool.query(
    "SELECT * FROM task WHERE event_idevent = ? ORDER BY created_at DESC",
    [eventId]
  );
  res.json({ success: true, data: tasks });
});

apiRouter.post("/tasks", async (req, res) => {
  const { event_idevent, title, description, priority, due_date } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO task (event_idevent, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)",
      [event_idevent, title, description, priority, due_date || null]
    );
    const insertId = result.insertId;
    const [rows] = await pool.query("SELECT * FROM task WHERE idtask = ?", [
      insertId,
    ]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.put("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const taskData = req.body;

  try {
    // Безопасно удаляем поля, которые не нужно обновлять напрямую
    delete taskData.idtask;
    delete taskData.event_idevent;
    delete taskData.created_at;

    // Преобразуем 'completed' в число, если поле существует
    if (taskData.hasOwnProperty("completed")) {
      taskData.completed = taskData.completed ? 1 : 0;
    }

    const fields = Object.keys(taskData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(taskData);

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    const sql = `UPDATE task SET ${fields} WHERE idtask = ?`;
    values.push(taskId);

    await pool.query(sql, values);

    const [rows] = await pool.query("SELECT * FROM task WHERE idtask = ?", [
      taskId,
    ]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    await pool.query("DELETE FROM task WHERE idtask = ?", [taskId]);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- DOCUMENTS & TEMPLATES ---

// Document Templates
apiRouter.get("/document-templates", async (req, res) => {
  try {
    const [templates] = await pool.query(
      "SELECT id, name, type, prefix FROM document_template ORDER BY name"
    );
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.get("/document-templates/:id", async (req, res) => {
  try {
    const [template] = await pool.query(
      "SELECT * FROM document_template WHERE id = ?",
      [req.params.id]
    );
    if (template.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, data: template[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post("/document-templates", async (req, res) => {
  const { name, type, prefix, content } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO document_template (name, type, prefix, content) VALUES (?, ?, ?, ?)",
      [name, type, prefix, content]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.put("/document-templates/:id", async (req, res) => {
  const { name, type, prefix, content } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE document_template SET name = ?, type = ?, prefix = ?, content = ? WHERE id = ?",
      [name, type, prefix, content, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.delete("/document-templates/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM document_template WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Documents
apiRouter.get("/documents", async (req, res) => {
  const sql = `
    SELECT d.*, e.project_name, dt.name as template_name
    FROM document d
    JOIN event e ON d.event_idevent = e.idevent
    LEFT JOIN document_template dt ON d.document_template_id = dt.id
    ORDER BY d.date DESC
  `;
  const [documents] = await pool.query(sql);
  res.json({ success: true, data: documents });
});

apiRouter.get("/events/:eventId/documents", async (req, res) => {
  const { eventId } = req.params;
  const sql = `
    SELECT d.iddocument, d.name, d.document_number, d.date, d.type
    FROM document d
    WHERE d.event_idevent = ?
    ORDER BY d.date DESC
  `;
  const [documents] = await pool.query(sql, [eventId]);
  res.json({ success: true, data: documents });
});

// CREATE a new document
apiRouter.post("/documents", async (req, res) => {
  const {
    event_idevent,
    name,
    document_number,
    date,
    type,
    file_path,
    content,
    document_template_id,
  } = req.body;
  try {
    const sql = `
      INSERT INTO document (event_idevent, name, document_number, date, type, file_path, content, document_template_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      event_idevent,
      name,
      document_number,
      date,
      type,
      file_path,
      content,
      document_template_id,
    ]);
    res.status(201).json({
      success: true,
      message: "Document created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE a document
apiRouter.put("/documents/:id", async (req, res) => {
  const { id } = req.params;
  const {
    event_idevent,
    name,
    document_number,
    date,
    type,
    file_path,
    content,
  } = req.body;
  try {
    const sql = `
      UPDATE document SET
        event_idevent = ?,
        name = ?,
        document_number = ?,
        date = ?,
        type = ?,
        file_path = ?,
        content = ?
      WHERE iddocument = ?
    `;
    await pool.query(sql, [
      event_idevent,
      name,
      document_number,
      date,
      type,
      file_path,
      content,
      id,
    ]);
    res.json({ success: true, message: "Document updated successfully" });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

apiRouter.post("/documents/generate", async (req, res) => {
  const { eventId, templateId } = req.body;
  if (!eventId || !templateId) {
    return res.status(400).json({
      success: false,
      message: "Event ID and Template ID are required.",
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [eventRows] = await connection.query(
      `SELECT e.*, c.name_customer, c.contact_person, c.phone as customer_phone, v.name_venue, v.address as venue_address
       FROM event e
       JOIN customer c ON e.customer_idcustomer = c.idcustomer
       JOIN venue v ON e.venue_idvenue = v.idvenue
       WHERE e.idevent = ?`,
      [eventId]
    );
    if (eventRows.length === 0) throw new Error("Мероприятие не найдено");
    const eventData = eventRows[0];

    const [templateRows] = await connection.query(
      "SELECT * FROM document_template WHERE id = ?",
      [templateId]
    );
    if (templateRows.length === 0) throw new Error("Шаблон не найден");
    const template = templateRows[0];

    const [companyRows] = await connection.query(
      "SELECT * FROM company_details WHERE is_active = 1 LIMIT 1"
    );
    if (companyRows.length === 0)
      throw new Error("Реквизиты компании не найдены");
    const company = companyRows[0];

    const docName = template.name
      .replace(/{{eventName}}/g, eventData.project_name || "...")
      .trim();
    const docDate = new Date();
    const docType = template.type;

    const [insertResult] = await connection.query(
      `INSERT INTO document (event_idevent, name, document_number, date, type, document_template_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, docName, "...creating...", docDate, docType, templateId]
    );
    const newDocId = insertResult.insertId;
    const docNumber = `${template.prefix || "DOC"}-${newDocId}`;

    await connection.query(
      `UPDATE document SET document_number = ? WHERE iddocument = ?`,
      [docNumber, newDocId]
    );
    await connection.commit();

    let html = template.content;
    const formatDate = (dateStr) =>
      dateStr ? new Date(dateStr).toLocaleDateString("ru-RU") : "не указана";
    const fill = (value, placeholder = "_".repeat(20)) => value || placeholder;

    const replacements = {
      documentNumber: fill(docNumber, "б/н"),
      documentDate: formatDate(docDate),
      customerName: fill(eventData.name_customer),
      customerContactPerson: fill(eventData.contact_person),
      customerPhone: fill(eventData.customer_phone),
      customerAddress: fill(null),
      customerPassport: fill(null),
      eventName: fill(eventData.project_name),
      eventDate: formatDate(eventData.date),
      eventVenue: fill(`${eventData.name_venue} (${eventData.venue_address})`),
      eventCost: eventData.cost
        ? String(eventData.cost).replace(/\.00$/, "")
        : "0",
      prepaymentAmount: eventData.cost
        ? String(eventData.cost / 2).replace(/\.00$/, "")
        : "0",
      executorName: fill(company.name),
      executorLegalBasis: fill(company.legal_basis),
      executorAddress: fill(company.address),
      executorInn: fill(company.inn),
      executorPhone: fill(company.phone),
      executorBankName: fill(company.bank_name),
      executorCheckingAccount: fill(company.checking_account),
      executorCorrespondentAccount: fill(company.correspondent_account),
      executorBic: fill(company.bic),
    };

    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    const safeFilename = `${docNumber}.pdf`.replace(/[^a-zA-Z0-9-._]/g, "_");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to generate document",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

apiRouter.get("/documents/:id/download", async (req, res) => {
  const { id } = req.params;
  try {
    const [docRows] = await pool.query(
      `SELECT d.*, e.project_name, e.date as event_date, e.cost, c.name_customer, c.contact_person, c.phone as customer_phone, v.name_venue, v.address as venue_address
       FROM document d
       JOIN event e ON d.event_idevent = e.idevent
       JOIN customer c ON e.customer_idcustomer = c.idcustomer
       JOIN venue v ON e.venue_idvenue = v.idvenue
       WHERE d.iddocument = ?`,
      [id]
    );

    if (docRows.length === 0) return res.status(404).send("Document not found");
    const doc = docRows[0];

    // --- NEW LOGIC ---
    // Use content from the document itself if it exists.
    // Otherwise, fall back to old behavior of generating from a template.
    let html = doc.content;

    // Fallback to template if content is empty
    if (!html && doc.document_template_id) {
      console.log(
        `Document ${id} has no content, falling back to template ${doc.document_template_id}`
      );
      const [templateRows] = await pool.query(
        "SELECT content FROM document_template WHERE id = ?",
        [doc.document_template_id]
      );
      if (templateRows.length > 0) {
        html = templateRows[0].content;
      }
    }

    if (!html) {
      return res
        .status(400)
        .send("Document has no content and no valid template associated.");
    }
    // --- END NEW LOGIC ---

    const [companyRows] = await pool.query(
      "SELECT * FROM company_details WHERE is_active = 1 LIMIT 1"
    );
    if (companyRows.length === 0)
      return res.status(404).send("Company details not found");
    const company = companyRows[0];

    const formatDate = (dateStr) =>
      dateStr ? new Date(dateStr).toLocaleDateString("ru-RU") : "не указана";
    const fill = (value, placeholder = "_".repeat(20)) => value || placeholder;

    const replacements = {
      documentNumber: fill(doc.document_number, "б/н"),
      documentDate: formatDate(doc.date),
      customerName: fill(doc.name_customer),
      customerContactPerson: fill(doc.contact_person),
      customerPhone: fill(doc.customer_phone),
      customerAddress: fill(null),
      customerPassport: fill(null),
      eventName: fill(doc.project_name),
      eventDate: formatDate(doc.event_date),
      eventVenue: fill(`${doc.name_venue} (${doc.venue_address})`),
      eventCost: doc.cost ? String(doc.cost).replace(/\.00$/, "") : "0",
      prepaymentAmount: doc.cost
        ? String(doc.cost / 2).replace(/\.00$/, "")
        : "0",
      executorName: fill(company.name),
      executorLegalBasis: fill(company.legal_basis),
      executorAddress: fill(company.address),
      executorInn: fill(company.inn),
      executorPhone: fill(company.phone),
      executorBankName: fill(company.bank_name),
      executorCheckingAccount: fill(company.checking_account),
      executorCorrespondentAccount: fill(company.correspondent_account),
      executorBic: fill(company.bic),
    };

    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    const safeDocNumber = (doc.document_number || String(id)).replace(
      /[^a-zA-Z0-9-]/g,
      "_"
    );
    const safeFilename = `doc_${safeDocNumber}.pdf`;

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF: " + error.message);
  }
});

apiRouter.delete("/documents/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM document WHERE iddocument = ?", [id]);
  res.json({ success: true, message: "Document deleted" });
});

// --- COMPANY DETAILS ---
apiRouter.get("/company-details", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM company_details WHERE is_active = 1"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch company details",
      error: error.message,
    });
  }
});

apiRouter.post("/company-details", async (req, res) => {
  const {
    name,
    legal_basis,
    inn,
    address,
    phone,
    bank_name,
    checking_account,
    correspondent_account,
    bic,
  } = req.body;
  const sql =
    "INSERT INTO company_details (name, legal_basis, inn, address, phone, bank_name, checking_account, correspondent_account, bic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const [result] = await pool.query(sql, [
    name,
    legal_basis,
    inn,
    address,
    phone,
    bank_name,
    checking_account,
    correspondent_account,
    bic,
  ]);
  res
    .status(201)
    .json({ success: true, data: { id: result.insertId, ...req.body } });
});

apiRouter.put("/company-details/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    legal_basis,
    inn,
    address,
    phone,
    bank_name,
    checking_account,
    correspondent_account,
    bic,
  } = req.body;
  const sql =
    "UPDATE company_details SET name = ?, legal_basis = ?, inn = ?, address = ?, phone = ?, bank_name = ?, checking_account = ?, correspondent_account = ?, bic = ? WHERE idcompany_details = ?";
  await pool.query(sql, [
    name,
    legal_basis,
    inn,
    address,
    phone,
    bank_name,
    checking_account,
    correspondent_account,
    bic,
    id,
  ]);
  res.json({ success: true, data: { id, ...req.body } });
});

apiRouter.delete("/company-details/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM company_details WHERE idcompany_details = ?", [
    id,
  ]);
  res.json({ success: true, message: "Company details deleted" });
});

// --- PARTICIPANTS ---
apiRouter.get("/participants", async (req, res) => {
  try {
    // Выбираем активных пользователей (сотрудников)
    const [users] = await pool.query(`
      SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) AS name, 
        (SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = u.id LIMIT 1) AS specialty,
        'Сотрудник' AS type, 
        CONCAT('user-', u.id) AS uniqueId 
      FROM 
        user u
    `);

    // Выбираем все внешние контакты
    const [contacts] = await pool.query(`
      SELECT 
        idcontact as id, 
        name, 
        specialty, 
        'Контакт' as type, 
        CONCAT('contact-', idcontact) as uniqueId 
      FROM contact
    `);

    // Объединяем два массива в один
    const combined = [...users, ...contacts];

    // Отправляем унифицированный список
    res.json({ success: true, data: combined });
  } catch (error) {
    console.error("Failed to get participants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- START SERVER ---
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
