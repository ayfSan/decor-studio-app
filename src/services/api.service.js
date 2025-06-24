import axios from "axios";
import NProgress from "nprogress";

console.log("--- API Service Version: VENUES_FIX_FINAL ---");

// Динамический импорт хранилища auth.store во избежание циклических зависимостей при запуске.
// Это позволяет api.service и auth.store импортировать друг друга.
const getAuthStore = async () => {
  const { useAuthStore } = await import("@/store/auth.store");
  return useAuthStore();
};

// Создаем экземпляр axios с базовой конфигурацией.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // Базовый URL для всех запросов
  headers: {
    "Content-Type": "application/json", // Тип контента по умолчанию
  },
});

// --- Перехватчики (Interceptors) ---

// Перехватчик запросов для отображения индикатора загрузки (NProgress).
apiClient.interceptors.request.use((config) => {
  NProgress.start(); // Показать индикатор
  return config;
});

// Перехватчик ответов для обработки результатов и ошибок.
apiClient.interceptors.response.use(
  (response) => {
    NProgress.done(); // Скрыть индикатор при успешном ответе
    return response;
  },
  async (error) => {
    NProgress.done(); // Скрыть индикатор при ошибке
    // Если сервер вернул ошибку 401 (Unauthorized) или 403 (Forbidden),
    // и это не запрос на страницу входа, то выполняем выход пользователя.
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !error.config.url.includes("/auth/login")
    ) {
      const authStore = await getAuthStore();
      authStore.logout(); // Вызываем action для выхода
    }
    // Возвращаем ошибку, чтобы она могла быть обработана дальше (например, в .catch()).
    return Promise.reject(error);
  }
);

/**
 * Объект `apiService` предоставляет удобные методы для взаимодействия с API.
 * Каждый метод соответствует определенному эндпоинту на сервере.
 */
const apiService = {
  // --- Аутентификация ---
  /**
   * Отправляет учетные данные на сервер для входа.
   * @param {object} credentials - Объект с username и password.
   * @returns {Promise} - Промис с ответом от сервера.
   */
  login(credentials) {
    return apiClient.post("/auth/login", credentials);
  },
  /**
   * Устанавливает заголовок Authorization для всех последующих запросов.
   * @param {string} token - JWT токен.
   */
  setAuthHeader(token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },
  /**
   * Удаляет заголовок Authorization из заголовков запросов.
   */
  removeAuthHeader() {
    delete apiClient.defaults.headers.common["Authorization"];
  },

  /**
   * Получает данные текущего аутентифицированного пользователя.
   * @returns {Promise} - Промис с данными пользователя.
   */
  getMe() {
    return apiClient.get("/auth/me");
  },

  // --- Статистика ---
  getStatistics() {
    return apiClient.get("/statistics");
  },
  getUpcomingEvents() {
    return apiClient.get("/events/upcoming");
  },

  // --- Мероприятия (Events) ---
  getEvents() {
    return apiClient.get("/events");
  },
  getEvent(id) {
    return apiClient.get(`/events/${id}`);
  },
  createEvent(event) {
    return apiClient.post("/events", event);
  },
  updateEvent(id, event) {
    return apiClient.put(`/events/${id}`, event);
  },
  deleteEvent(id) {
    return apiClient.delete(`/events/${id}`);
  },

  // --- Справочники ---
  getEventCategories() {
    return apiClient.get("/event-categories");
  },
  createEventCategory(category) {
    return apiClient.post("/event-categories", category);
  },
  updateEventCategory(id, category) {
    return apiClient.put(`/event-categories/${id}`, category);
  },
  deleteEventCategory(id) {
    return apiClient.delete(`/event-categories/${id}`);
  },
  getVenues() {
    return apiClient.get("/venues");
  },
  createVenue(venue) {
    return apiClient.post("/venues", venue);
  },
  updateVenue(id, venue) {
    return apiClient.put(`/venues/${id}`, venue);
  },
  deleteVenue(id) {
    return apiClient.delete(`/venues/${id}`);
  },
  getCustomers() {
    return apiClient.get("/customers");
  },
  createCustomer(customer) {
    return apiClient.post("/customers", customer);
  },
  updateCustomer(id, customer) {
    return apiClient.put(`/customers/${id}`, customer);
  },
  deleteCustomer(id) {
    return apiClient.delete(`/customers/${id}`);
  },
  getParticipants() {
    return apiClient.get("/participants");
  },
  getTeamMembers() {
    return this.getParticipants();
  },
  getUsers() {
    return apiClient.get("/users");
  },
  getContacts() {
    return apiClient.get("/contacts");
  },

  // --- Учет средств (Cashflow) ---
  getCashflow(eventId = null) {
    const params = eventId ? { eventId } : {};
    return apiClient.get("/cashflow", { params });
  },
  createCashflow(transaction) {
    return apiClient.post("/cashflow", transaction);
  },
  updateCashflow(id, transaction) {
    return apiClient.put(`/cashflow/${id}`, transaction);
  },
  deleteCashflow(id) {
    return apiClient.delete(`/cashflow/${id}`);
  },
  getCashflowAccounts() {
    return apiClient.get("/cashflow-accounts");
  },
  getCashflowCategories() {
    return apiClient.get("/cashflow-categories");
  },

  // --- Шаблоны документов ---
  getDocumentTemplates() {
    return apiClient.get("/document-templates");
  },
  getDocumentTemplate(id) {
    return apiClient.get(`/document-templates/${id}`);
  },
  createDocumentTemplate(template) {
    return apiClient.post("/document-templates", template);
  },
  updateDocumentTemplate(id, template) {
    return apiClient.put(`/document-templates/${id}`, template);
  },
  deleteDocumentTemplate(id) {
    return apiClient.delete(`/document-templates/${id}`);
  },

  // --- Документы ---
  getDocuments() {
    return apiClient.get("/documents");
  },
  getDocument(id) {
    return apiClient.get(`/documents/${id}`);
  },
  createDocument(document) {
    return apiClient.post("/documents", document);
  },
  updateDocument(id, document) {
    return apiClient.put(`/documents/${id}`, document);
  },
  getEventDocuments(eventId) {
    return apiClient.get(`/events/${eventId}/documents`);
  },
  generateDocument(eventId, templateId) {
    return apiClient.post("/documents/generate", {
      eventId: eventId,
      templateId: templateId,
    });
  },
  downloadDocument(documentId) {
    return apiClient.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
  },
  deleteDocument(documentId) {
    return apiClient.delete(`/documents/${documentId}`);
  },

  // --- Задачи (Todo List) ---
  getTasksForEvent(eventId) {
    return apiClient.get(`/events/${eventId}/tasks`);
  },
  createTask(task) {
    return apiClient.post("/tasks", task);
  },
  updateTask(id, task) {
    return apiClient.put(`/tasks/${id}`, task);
  },
  deleteTask(id) {
    return apiClient.delete(`/tasks/${id}`);
  },

  // --- Реквизиты компании ---
  getCompanyDetails() {
    return apiClient.get("/company-details");
  },
  createCompanyDetails(details) {
    return apiClient.post("/company-details", details);
  },
  updateCompanyDetails(id, details) {
    return apiClient.put(`/company-details/${id}`, details);
  },
  deleteCompanyDetails(id) {
    return apiClient.delete(`/company-details/${id}`);
  },

  // --- Привязка Telegram ---
  generateLinkCode() {
    return apiClient.post("/users/me/generate-link-code");
  },
};

export default apiService;
