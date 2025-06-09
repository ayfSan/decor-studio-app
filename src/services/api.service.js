import NProgress from "nprogress";
import authService from "./auth.service.js";

const API_URL = "http://localhost:3000/api";

async function fetchFromApi(endpoint, options = {}) {
  NProgress.start();
  try {
    const token = authService.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method: options.method || "GET",
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_URL}/${endpoint}`, config);

    if (!response.ok) {
      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#dc3545";
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#28a745";
    }

    return await response.json();
  } catch (error) {
    if (document.querySelector("#nprogress .bar")) {
      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#dc3545";
    }
    console.error(`Could not fetch from endpoint: ${endpoint}`, error);
    throw error;
  } finally {
    NProgress.done();
  }
}

export default {
  getApiUrl() {
    return API_URL;
  },

  // --- Home Page ---
  getStatistics() {
    return fetchFromApi("statistics");
  },
  getUpcomingEvents() {
    return fetchFromApi("events/upcoming");
  },

  // --- Cashflow ---
  getAccounts() {
    return fetchFromApi("cashflow/accounts");
  },
  createAccount(data) {
    return fetchFromApi("cashflow/accounts", {
      method: "POST",
      body: data,
    });
  },
  updateAccount(id, data) {
    return fetchFromApi(`cashflow/accounts/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteAccount(id) {
    return fetchFromApi(`cashflow/accounts/${id}`, {
      method: "DELETE",
    });
  },
  getCashflowCategories() {
    return fetchFromApi("cashflow-categories");
  },
  createCashflowTransaction(transactionData) {
    return fetchFromApi("cashflow", {
      method: "POST",
      body: transactionData,
    });
  },
  getCashflow() {
    return fetchFromApi("cashflow");
  },
  updateCashflow(id, data) {
    return fetchFromApi(`cashflow/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteCashflow(id) {
    return fetchFromApi(`cashflow/${id}`, {
      method: "DELETE",
    });
  },

  // --- General ---
  testApi() {
    return fetchFromApi("test");
  },
  getEvents() {
    return fetchFromApi("events");
  },
  getEvent(id) {
    return fetchFromApi(`events/${id}`);
  },
  getVenues() {
    return fetchFromApi("venues");
  },
  createVenue(data) {
    return fetchFromApi("venues", {
      method: "POST",
      body: data,
    });
  },
  updateVenue(id, data) {
    return fetchFromApi(`venues/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteVenue(id) {
    return fetchFromApi(`venues/${id}`, {
      method: "DELETE",
    });
  },
  getEventCategories() {
    return fetchFromApi("event-categories");
  },
  createEventCategory(data) {
    return fetchFromApi("event-categories", {
      method: "POST",
      body: data,
    });
  },
  updateEventCategory(id, data) {
    return fetchFromApi(`event-categories/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteEventCategory(id) {
    return fetchFromApi(`event-categories/${id}`, {
      method: "DELETE",
    });
  },
  createCashflowCategory(data) {
    return fetchFromApi("cashflow-categories", {
      method: "POST",
      body: data,
    });
  },
  updateCashflowCategory(id, data) {
    return fetchFromApi(`cashflow-categories/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteCashflowCategory(id) {
    return fetchFromApi(`cashflow-categories/${id}`, {
      method: "DELETE",
    });
  },
  getCustomers() {
    return fetchFromApi("customers");
  },
  createCustomer(data) {
    return fetchFromApi("customers", {
      method: "POST",
      body: data,
    });
  },
  updateCustomer(id, data) {
    return fetchFromApi(`customers/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteCustomer(id) {
    return fetchFromApi(`customers/${id}`, {
      method: "DELETE",
    });
  },
  createEvent(eventData) {
    return fetchFromApi("events", {
      method: "POST",
      body: eventData,
    });
  },
  updateEvent(id, eventData) {
    return fetchFromApi(`events/${id}`, {
      method: "PUT",
      body: eventData,
    });
  },
  deleteEvent(id) {
    return fetchFromApi(`events/${id}`, {
      method: "DELETE",
    });
  },

  // --- Contacts ---
  createContact(data) {
    return fetchFromApi("contacts", {
      method: "POST",
      body: data,
    });
  },
  updateContact(id, data) {
    return fetchFromApi(`contacts/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteContact(id) {
    return fetchFromApi(`contacts/${id}`, {
      method: "DELETE",
    });
  },

  // --- Tasks ---
  getTasksForEvent(eventId) {
    return fetchFromApi(`events/${eventId}/tasks`);
  },
  createTask(taskData) {
    return fetchFromApi("tasks", {
      method: "POST",
      body: taskData,
    });
  },
  updateTask(taskId, taskData) {
    return fetchFromApi(`tasks/${taskId}`, {
      method: "PUT",
      body: taskData,
    });
  },
  deleteTask(taskId) {
    return fetchFromApi(`tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  // --- Documents ---
  getDocumentsForEvent(eventId) {
    return fetchFromApi(`events/${eventId}/documents`);
  },
  getDocumentTemplates() {
    return fetchFromApi("document-templates");
  },
  getDocumentTemplate(id) {
    return fetchFromApi(`document-templates/${id}`);
  },
  createDocumentTemplate(data) {
    return fetchFromApi("document-templates", { method: "POST", body: data });
  },
  updateDocumentTemplate(id, data) {
    return fetchFromApi(`document-templates/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteDocumentTemplate(id) {
    return fetchFromApi(`document-templates/${id}`, { method: "DELETE" });
  },
  async generateDocument(data) {
    NProgress.start();
    try {
      const response = await fetch(`${API_URL}/documents/generate`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Произошла неизвестная ошибка на сервере.",
        }));
        throw new Error(
          errorData.message || `Ошибка сервера: ${response.statusText}`
        );
      }

      const blob = await response.blob();
      let filename = `document.pdf`;
      const disposition = response.headers.get("Content-Disposition");
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#28a745";
      return { success: true }; // Возвращаем успех для обработки в компоненте
    } catch (error) {
      console.error(`Не удалось сгенерировать документ:`, error);
      if (document.querySelector("#nprogress .bar")) {
        document.querySelector("#nprogress .bar").style.backgroundColor =
          "#dc3545";
      }
      throw error;
    } finally {
      NProgress.done();
    }
  },
  getDocuments() {
    return fetchFromApi("documents");
  },
  createDocument(data) {
    return fetchFromApi("documents", {
      method: "POST",
      body: data,
    });
  },
  updateDocument(id, data) {
    return fetchFromApi(`documents/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteDocument(id) {
    return fetchFromApi(`documents/${id}`, { method: "DELETE" });
  },
  getDocumentDownloadUrl(id) {
    return `${API_URL}/documents/${id}/download`;
  },
  async downloadDocument(id) {
    NProgress.start();
    try {
      const response = await fetch(`${API_URL}/documents/${id}/download`);
      if (!response.ok) {
        throw new Error(`Ошибка при скачивании файла: ${response.statusText}`);
      }

      const blob = await response.blob();

      let filename = `document-${id}.pdf`;
      const disposition = response.headers.get("Content-Disposition");
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      document.querySelector("#nprogress .bar").style.backgroundColor =
        "#28a745";
    } catch (error) {
      console.error(`Не удалось скачать документ: ${id}`, error);
      if (document.querySelector("#nprogress .bar")) {
        document.querySelector("#nprogress .bar").style.backgroundColor =
          "#dc3545";
      }
      throw error; // Передаем ошибку дальше, чтобы компонент мог ее обработать
    } finally {
      NProgress.done();
    }
  },

  // --- Users ---
  getUsers() {
    return fetchFromApi("users");
  },
  createUser(data) {
    return fetchFromApi("users", {
      method: "POST",
      body: data,
    });
  },
  updateUser(id, data) {
    return fetchFromApi(`users/${id}`, {
      method: "PUT",
      body: data,
    });
  },
  deleteUser(id) {
    return fetchFromApi(`users/${id}`, {
      method: "DELETE",
    });
  },

  getTeamMembers() {
    return fetchFromApi("team-members");
  },
  getEventParticipants(eventId) {
    return fetchFromApi(`events/${eventId}/participants`);
  },
  addParticipant(eventId, uniqueId) {
    return fetchFromApi(`events/${eventId}/participants`, {
      method: "POST",
      body: { uniqueId },
    });
  },
};
