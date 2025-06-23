import { defineStore } from "pinia";
import apiService from "@/services/api.service";
import router from "@/router";

/**
 * Хранилище (store) для управления состоянием аутентификации пользователя.
 * Использует Pinia.
 */
export const useAuthStore = defineStore("auth", {
  // Состояние хранилища
  state: () => ({
    // Данные о пользователе. Загружаются из localStorage для сохранения сессии.
    user: JSON.parse(localStorage.getItem("user")),
    // JWT токен доступа. Загружается из localStorage.
    token: localStorage.getItem("token"),
    // URL для перенаправления после успешного входа.
    returnUrl: null,
  }),
  // Геттеры для получения производных данных из состояния
  getters: {
    // Проверяет, аутентифицирован ли пользователь (есть ли токен).
    isAuthenticated: (state) => !!state.token,
    // Возвращает роли текущего пользователя.
    userRoles: (state) => state.user?.roles || [],
    // Возвращает объект текущего пользователя.
    currentUser: (state) => state.user,
  },
  // Действия (actions) для изменения состояния
  actions: {
    /**
     * Выполняет вход пользователя в систему.
     * @param {string} username - Имя пользователя.
     * @param {string} password - Пароль.
     */
    async login(username, password) {
      console.log("[AUTH STORE] Attempting login...");
      // Вызываем метод API для входа. Ошибка будет перехвачена в компоненте.
      const response = await apiService.login({ username, password });

      // Получаем токен и данные пользователя из ответа API.
      const { accessToken, user } = response.data;

      console.log(
        "[AUTH STORE] Login API call successful. Token received:",
        accessToken
      );

      // Обновляем состояние хранилища
      this.token = accessToken;
      this.user = user;

      // Сохраняем токен и данные пользователя в localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Устанавливаем заголовок авторизации для всех последующих запросов
      apiService.setAuthHeader(accessToken);

      // Перенаправляем пользователя на запрошенную страницу или на главную
      await router.push(this.returnUrl || "/");
      this.returnUrl = null;
    },
    /**
     * Выполняет выход пользователя из системы.
     */
    logout() {
      // Очищаем состояние
      this.user = null;
      this.token = null;

      // Удаляем данные из localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Удаляем заголовок авторизации из запросов
      apiService.removeAuthHeader();

      // Перенаправляем на страницу входа
      router.push("/login");
    },
    /**
     * Проверяет состояние аутентификации при загрузке приложения.
     * Если токен есть в localStorage, устанавливает его для будущих запросов.
     */
    async checkAuth() {
      if (this.token) {
        apiService.setAuthHeader(this.token);
        // В будущем здесь можно добавить логику проверки токена на валидность через API,
        // чтобы убедиться, что сессия на сервере не истекла.
      }
    },

    /**
     * Обновляет данные пользователя в хранилище.
     * @param {object} newUser - Новый объект пользователя.
     */
    setUser(newUser) {
      this.user = newUser;
      localStorage.setItem("user", JSON.stringify(newUser));
    },
  },
});
