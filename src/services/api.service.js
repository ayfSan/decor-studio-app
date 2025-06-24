import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import NProgress from "nprogress";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    NProgress.start();
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers["Authorization"] = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    NProgress.done();
    return response;
  },
  (error) => {
    NProgress.done();
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !error.config.url.includes("/auth/login")
    ) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

class ApiService {
  get(resource, params) {
    return apiClient.get(resource, { params });
  }

  post(resource, data) {
    return apiClient.post(resource, data);
  }

  put(resource, data) {
    return apiClient.put(resource, data);
  }

  delete(resource) {
    return apiClient.delete(resource);
  }

  // Auth & Users
  login(credentials) {
    return this.post("auth/login", credentials);
  }
  getMe() {
    return this.get("auth/me");
  }
  getUsers() {
    return this.get("users");
  }
  createUser(data) {
    return this.post("users", data);
  }
  updateUser(id, data) {
    return this.put(`users/${id}`, data);
  }
  deleteUser(id) {
    return this.delete(`users/${id}`);
  }

  // Statistics & Dashboard
  getStatistics() {
    return this.get("statistics");
  }
  getUpcomingEvents() {
    return this.get("events/upcoming");
  }

  // Events
  getEvents() {
    return this.get("events");
  }
  getEvent(id) {
    return this.get(`/events/${id}`);
  }
  createEvent(event) {
    return this.post("events", event);
  }
  updateEvent(id, event) {
    return this.put(`/events/${id}`, event);
  }
  deleteEvent(id) {
    return this.delete(`/events/${id}`);
  }

  // Dictionaries
  getEventCategories() {
    return this.get("event-categories");
  }
  getVenues() {
    return this.get("venues");
  }
  getCustomers() {
    return this.get("customers");
  }
  getContacts() {
    return this.get("contacts");
  }

  // Cashflow
  getCashflow(params) {
    return this.get("cashflow", params);
  }
  createCashflow(transaction) {
    return this.post("cashflow", transaction);
  }
  updateCashflow(id, transaction) {
    return this.put(`cashflow/${id}`, transaction);
  }
  deleteCashflow(id) {
    return this.delete(`cashflow/${id}`);
  }
  getCashflowAccounts() {
    return this.get("cashflow-accounts");
  }
  getCashflowCategories() {
    return this.get("cashflow-categories");
  }

  // Document Templates
  getDocumentTemplates() {
    return this.get("document-templates");
  }
  getDocumentTemplate(id) {
    return this.get(`document-templates/${id}`);
  }
  createDocumentTemplate(template) {
    return this.post("document-templates", template);
  }
  updateDocumentTemplate(id, template) {
    return this.put(`document-templates/${id}`, template);
  }
  deleteDocumentTemplate(id) {
    return this.delete(`document-templates/${id}`);
  }

  // Documents
  getEventDocuments(eventId) {
    return this.get(`events/${eventId}/documents`);
  }
  generateDocument(data) {
    return this.post("documents/generate", data);
  }
  downloadDocument(id) {
    return apiClient.get(`documents/${id}/download`, { responseType: "blob" });
  }
  deleteDocument(id) {
    return this.delete(`documents/${id}`);
  }

  // Tasks
  getTasksForEvent(eventId) {
    return this.get(`events/${eventId}/tasks`);
  }
  createTask(task) {
    return this.post("tasks", task);
  }
  updateTask(id, task) {
    return this.put(`tasks/${id}`, task);
  }
  deleteTask(id) {
    return this.delete(`tasks/${id}`);
  }

  // Company Details
  getCompanyDetails() {
    return this.get("company-details");
  }
  updateCompanyDetails(data) {
    return this.put("company-details", data);
  }

  // Telegram link
  generateLinkCode() {
    return this.post("users/me/generate-link-code");
  }
}

export default new ApiService();
