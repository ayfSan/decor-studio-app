import express from "express";
import cors from "cors";
import pool from "./api/database.js";
import puppeteer from "puppeteer";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    res
      .status(500)
      .json({
        success: false,
        message: "API is not working",
        error: error.message,
      });
  }
});

// --- HOME PAGE ---
app.get("/api/statistics", async (req, res) => {
  try {
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
    res.json({
      success: true,
      data: {
        activeEvents: activeEvents[0].count,
        teamMembers: usersCount[0].count + contactsCount[0].count,
        completedThisMonth: completedThisMonth[0].count,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch statistics",
        error: error.message,
      });
  }
});

app.get("/api/events/upcoming", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT idevent, project_name, date FROM event WHERE date >= CURDATE() ORDER BY date ASC LIMIT 5"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch upcoming events",
        error: error.message,
      });
  }
});

// --- EVENTS ---
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM event ORDER BY date DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch events",
        error: error.message,
      });
  }
});

app.get("/api/events/:id", async (req, res) => {
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch event details",
        error: error.message,
      });
  }
});

app.post("/api/events", async (req, res) => {
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create event",
        error: error.message,
      });
  } finally {
    connection.release();
  }
});

app.put("/api/events/:id", async (req, res) => {
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update event",
        error: error.message,
      });
  } finally {
    connection.release();
  }
});

app.delete("/api/events/:id", async (req, res) => {
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete event",
        error: error.message,
      });
  } finally {
    connection.release();
  }
});

// --- EVENT CATEGORIES ---
app.get("/api/event-categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM category_event ORDER BY name"
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch event categories",
        error: error.message,
      });
  }
});

app.post("/api/event-categories", async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query(
      "INSERT INTO category_event (name) VALUES (?)",
      [name]
    );
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, name } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create event category",
        error: error.message,
      });
  }
});

app.put("/api/event-categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query(
      "UPDATE category_event SET name = ? WHERE idcategory_event = ?",
      [name, id]
    );
    res.json({ success: true, data: { id, name } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update event category",
        error: error.message,
      });
  }
});

app.delete("/api/event-categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM category_event WHERE idcategory_event = ?", [
      id,
    ]);
    res.json({ success: true, message: "Event category deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete event category",
        error: error.message,
      });
  }
});

// --- USERS ---
app.get("/api/users", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, telegram_id, username, first_name, last_name, role, created_at FROM user ORDER BY first_name, last_name"
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name, role } = req.body;
    const sql =
      "INSERT INTO user (telegram_id, username, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      telegram_id,
      username,
      first_name,
      last_name,
      role,
    ]);
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { telegram_id, username, first_name, last_name, role } = req.body;
    const sql =
      "UPDATE user SET telegram_id = ?, username = ?, first_name = ?, last_name = ?, role = ? WHERE id = ?";
    await pool.query(sql, [
      telegram_id,
      username,
      first_name,
      last_name,
      role,
      id,
    ]);
    res.json({ success: true, data: { id, ...req.body } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update user",
        error: error.message,
      });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM user WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete user",
        error: error.message,
      });
  }
});

// --- TEAM (Contacts + Users) ---
app.get("/api/team-members", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, CONCAT(first_name, ' ', last_name) as name, role, 'Сотрудник' as type FROM user"
    );
    const [contacts] = await pool.query(
      "SELECT idcontact as id, name, specialty as role, 'Контакт' as type FROM contact"
    );
    const teamMembers = [
      ...users.map((u) => ({ ...u, uniqueId: `user-${u.id}` })),
      ...contacts.map((c) => ({ ...c, uniqueId: `contact-${c.id}` })),
    ];
    res.json({ success: true, data: teamMembers });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch team members",
        error: error.message,
      });
  }
});

// --- VENUES ---
app.get("/api/venues", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM venue ORDER BY name_venue");
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch venues",
        error: error.message,
      });
  }
});

app.post("/api/venues", async (req, res) => {
  try {
    const { name_venue, address, contact_person, phone, notes } = req.body;
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create venue",
        error: error.message,
      });
  }
});

app.put("/api/venues/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name_venue, address, contact_person, phone, notes } = req.body;
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update venue",
        error: error.message,
      });
  }
});

app.delete("/api/venues/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM venue WHERE idvenue = ?", [id]);
    res.json({ success: true, message: "Venue deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete venue",
        error: error.message,
      });
  }
});

// --- CUSTOMERS ---
app.get("/api/customers", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customer ORDER BY name_customer"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch customers",
        error: error.message,
      });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name_customer, contact_person, phone, telegram_username, notes } =
      req.body;
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create customer",
        error: error.message,
      });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name_customer, contact_person, phone, telegram_username, notes } =
      req.body;
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update customer",
        error: error.message,
      });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM customer WHERE idcustomer = ?", [id]);
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete customer",
        error: error.message,
      });
  }
});

// --- CASHFLOW ---
app.get("/api/cashflow", async (req, res) => {
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch cashflow records",
        error: error.message,
      });
  }
});

app.post("/api/cashflow", async (req, res) => {
  try {
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
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create cashflow transaction",
        error: error.message,
      });
  }
});

app.put("/api/cashflow/:id", async (req, res) => {
  try {
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
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update cashflow record",
        error: error.message,
      });
  }
});

app.delete("/api/cashflow/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM cashflow WHERE idcashflow = ?", [id]);
    res.json({ success: true, message: "Cashflow record deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete cashflow record",
        error: error.message,
      });
  }
});

// --- CASHFLOW ACCOUNTS ---
app.get("/api/cashflow/accounts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM account_cashflow ORDER BY name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch cashflow accounts",
        error: error.message,
      });
  }
});

app.post("/api/cashflow/accounts", async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query(
      "INSERT INTO account_cashflow (name) VALUES (?)",
      [name]
    );
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, name } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create account",
        error: error.message,
      });
  }
});

app.put("/api/cashflow/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query(
      "UPDATE account_cashflow SET name = ? WHERE idaccount_cashflow = ?",
      [name, id]
    );
    res.json({ success: true, data: { id, name } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update account",
        error: error.message,
      });
  }
});

app.delete("/api/cashflow/accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "DELETE FROM account_cashflow WHERE idaccount_cashflow = ?",
      [id]
    );
    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete account",
        error: error.message,
      });
  }
});

// --- CASHFLOW CATEGORIES ---
app.get("/api/cashflow-categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM category_cashflow ORDER BY name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch cashflow categories",
        error: error.message,
      });
  }
});

app.post("/api/cashflow-categories", async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query(
      "INSERT INTO category_cashflow (name) VALUES (?)",
      [name]
    );
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, name } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create cashflow category",
        error: error.message,
      });
  }
});

app.put("/api/cashflow-categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query(
      "UPDATE category_cashflow SET name = ? WHERE idcategory_cashflow = ?",
      [name, id]
    );
    res.json({ success: true, data: { id, name } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update cashflow category",
        error: error.message,
      });
  }
});

app.delete("/api/cashflow-categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "DELETE FROM category_cashflow WHERE idcategory_cashflow = ?",
      [id]
    );
    res.json({ success: true, message: "Cashflow category deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete cashflow category",
        error: error.message,
      });
  }
});

// --- TASKS ---
app.get("/api/events/:eventId/tasks", async (req, res) => {
  try {
    const { eventId } = req.params;
    const [tasks] = await pool.query(
      "SELECT * FROM task WHERE event_idevent = ? ORDER BY created_at DESC",
      [eventId]
    );
    res.json({ success: true, data: tasks });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch tasks",
        error: error.message,
      });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { event_idevent, title, description, priority, due_date } = req.body;
    const sql =
      "INSERT INTO task (event_idevent, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      event_idevent,
      title,
      description,
      priority,
      due_date || null,
    ]);
    res
      .status(201)
      .json({
        success: true,
        data: { id: result.insertId, ...req.body, completed: 0 },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create task",
        error: error.message,
      });
  }
});

app.put("/api/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, due_date, completed } = req.body;
    const sql =
      "UPDATE task SET title = ?, description = ?, priority = ?, due_date = ?, completed = ? WHERE idtask = ?";
    await pool.query(sql, [
      title,
      description,
      priority,
      due_date || null,
      completed,
      taskId,
    ]);
    res.json({ success: true, data: { id: taskId, ...req.body } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update task",
        error: error.message,
      });
  }
});

app.delete("/api/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    await pool.query("DELETE FROM task WHERE idtask = ?", [taskId]);
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete task",
        error: error.message,
      });
  }
});

// --- DOCUMENTS & TEMPLATES ---
app.get("/api/documents", async (req, res) => {
  try {
    const sql = `
      SELECT d.*, e.project_name, dt.name as template_name
      FROM document d
      JOIN event e ON d.event_idevent = e.idevent
      LEFT JOIN document_template dt ON d.document_template_id = dt.id
      ORDER BY d.date DESC
    `;
    const [documents] = await pool.query(sql);
    res.json({ success: true, data: documents });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch documents",
        error: error.message,
      });
  }
});

app.get("/api/events/:eventId/documents", async (req, res) => {
  try {
    const { eventId } = req.params;
    const sql = `
      SELECT d.iddocument, d.name, d.document_number, d.date, d.type
      FROM document d
      WHERE d.event_idevent = ?
      ORDER BY d.date DESC
    `;
    const [documents] = await pool.query(sql, [eventId]);
    res.json({ success: true, data: documents });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch documents for event",
        error: error.message,
      });
  }
});

app.post("/api/documents/generate", async (req, res) => {
  const { eventId, templateId } = req.body;
  if (!eventId || !templateId) {
    return res
      .status(400)
      .json({
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
      headless: true,
      args: ["--no-sandbox"],
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to generate document",
        error: error.message,
      });
  } finally {
    connection.release();
  }
});

app.get("/api/documents/:id/download", async (req, res) => {
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

    const [companyRows] = await pool.query(
      "SELECT * FROM company_details WHERE is_active = 1 LIMIT 1"
    );
    if (companyRows.length === 0)
      return res.status(404).send("Company details not found");
    const company = companyRows[0];

    if (!doc.document_template_id)
      return res.status(400).send("The document is not linked to a template.");

    const [templateRows] = await pool.query(
      "SELECT content FROM document_template WHERE id = ?",
      [doc.document_template_id]
    );
    if (templateRows.length === 0)
      return res.status(404).send("Document template not found");
    let html = templateRows[0].content;

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
      headless: true,
      args: ["--no-sandbox"],
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
      "Content-Disposition": `inline; filename="${safeFilename}"`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send("Error generating PDF: " + error.message);
  }
});

app.get("/api/document-templates", async (req, res) => {
  try {
    const [templates] = await pool.query(
      "SELECT id, name, type, prefix FROM document_template ORDER BY name"
    );
    res.json({ success: true, data: templates });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch document templates",
        error: error.message,
      });
  }
});

app.get("/api/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [template] = await pool.query(
      "SELECT * FROM document_template WHERE id = ?",
      [id]
    );
    if (template.length > 0) {
      res.json({ success: true, data: template[0] });
    } else {
      res.status(404).json({ success: false, message: "Template not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch single document template",
        error: error.message,
      });
  }
});

app.post("/api/document-templates", async (req, res) => {
  try {
    const { name, type, prefix, content } = req.body;
    const sql =
      "INSERT INTO document_template (name, type, prefix, content) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(sql, [
      name,
      type,
      prefix || null,
      content,
    ]);
    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create document template",
        error: error.message,
      });
  }
});

app.put("/api/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, prefix, content } = req.body;
    const sql =
      "UPDATE document_template SET name = ?, type = ?, prefix = ?, content = ? WHERE id = ?";
    await pool.query(sql, [name, type, prefix || null, content, id]);
    res.json({ success: true, data: { id, ...req.body } });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update document template",
        error: error.message,
      });
  }
});

app.delete("/api/document-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM document_template WHERE id = ?", [id]);
    res.json({ success: true, message: "Document template deleted" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete document template",
        error: error.message,
      });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
