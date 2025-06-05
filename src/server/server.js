import express from "express";
import cors from "cors";
import pool from "./api/database.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Тестовый маршрут для проверки работы API
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

// Маршрут для получения всех событий
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM event");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});

// Маршрут для получения одного мероприятия по ID
app.get("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM event WHERE idevent = ?", [
      id,
    ]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
});

// Маршрут для получения категорий мероприятий
app.get("/api/event-categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM category_event ORDER BY name"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event categories",
      error: error.message,
    });
  }
});

// Маршрут для получения мест
app.get("/api/venues", async (req, res) => {
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

// Маршрут для получения клиентов
app.get("/api/customers", async (req, res) => {
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

// Маршрут для создания нового мероприятия
app.post("/api/events", async (req, res) => {
  try {
    const {
      date,
      project_name,
      category_event_idcategory_event,
      venue_idvenue,
      customer_idcustomer,
      cost,
      participants,
    } = req.body;

    const sql = `
      INSERT INTO event 
      (date, project_name, category_event_idcategory_event, venue_idvenue, customer_idcustomer, cost, participants) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      date,
      project_name,
      category_event_idcategory_event,
      venue_idvenue,
      customer_idcustomer,
      cost,
      participants,
    ]);

    res
      .status(201)
      .json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
});

// Маршрут для обновления мероприятия (С УЧАСТНИКАМИ)
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
    const eventUpdateQuery = `UPDATE event SET date = ?, project_name = ?, category_event_idcategory_event = ?, venue_idvenue = ?, customer_idcustomer = ?, cost = ? WHERE idevent = ?`;
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
    console.error("Error updating event with participants:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// Маршрут для удаления мероприятия
app.delete("/api/events/:id", async (req, res) => {
  const eventId = req.params.id;
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

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
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// Маршрут для получения всех возможных участников команды
app.get("/api/team-members", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, CONCAT(first_name, ' ', last_name) as name, 'Сотрудник' as type FROM user"
    );
    const [contacts] = await pool.query(
      "SELECT idcontact as id, name as name, 'Контакт' as type FROM contact"
    );

    const teamMembers = [
      ...users.map((u) => ({ ...u, uniqueId: `user-${u.id}` })),
      ...contacts.map((c) => ({ ...c, uniqueId: `contact-${c.id}` })),
    ];

    res.json({ success: true, data: teamMembers });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
});

// Маршрут для получения участников конкретного мероприятия
app.get("/api/events/:id/participants", async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await pool.query(
      `
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, 'Сотрудник' as type
      FROM user u
      JOIN event_user eu ON u.id = eu.user_id
      WHERE eu.event_idevent = ?`,
      [id]
    );

    const [contacts] = await pool.query(
      `
      SELECT c.idcontact as id, c.name as name, 'Контакт' as type
      FROM contact c
      JOIN event_contact ec ON c.idcontact = ec.contact_idcontact
      WHERE ec.event_idevent = ?`,
      [id]
    );

    const participants = [
      ...users.map((u) => ({ ...u, uniqueId: `user-${u.id}` })),
      ...contacts.map((c) => ({ ...c, uniqueId: `contact-${c.idcontact}` })),
    ];

    res.json({ success: true, data: participants });
  } catch (error) {
    console.error(`Error fetching participants for event ${id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch participants",
      error: error.message,
    });
  }
});

// Маршрут для добавления участника на мероприятие (БОЛЬШЕ НЕ ИСПОЛЬЗУЕТСЯ, НО МОЖЕТ ПРИГОДИТЬСЯ)
app.post("/api/events/:id/participants", async (req, res) => {
  const eventId = req.params.id;
  const { uniqueId } = req.body;

  if (!uniqueId) {
    return res
      .status(400)
      .json({ success: false, message: "uniqueId is required" });
  }

  const [type, id] = uniqueId.split("-");
  let sql;
  let params = [eventId, id];

  if (type === "user") {
    sql = "INSERT INTO event_user (event_idevent, user_id) VALUES (?, ?)";
  } else if (type === "contact") {
    sql =
      "INSERT INTO event_contact (event_idevent, contact_idcontact) VALUES (?, ?)";
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid participant type" });
  }

  try {
    await pool.query(sql, params);
    res.status(201).json({ success: true, message: "Participant added" });
  } catch (error) {
    console.error("Error adding participant:", error);
    // Проверяем на ошибку дубликата
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Participant already in event" });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add participant",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
