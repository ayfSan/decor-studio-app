import apiService from "./api.service.js";

const USER_TOKEN_KEY = "user_token";

class AuthService {
  async login(username, password) {
    try {
      // Это заглушка. В реальном приложении здесь будет POST-запрос к API.
      // const response = await apiService.post('/login', { username, password });
      // Для демонстрации, предположим, что сервер возвращает токен, если
      // логин и пароль - 'admin'.
      if (username === "admin" && password === "admin") {
        const mockToken = "fake-jwt-token-" + new Date().getTime();
        localStorage.setItem(USER_TOKEN_KEY, mockToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      this.logout(); // Очищаем токен в случае ошибки
      throw error;
    }
  }

  logout() {
    localStorage.removeItem(USER_TOKEN_KEY);
  }

  isAuthenticated() {
    return !!localStorage.getItem(USER_TOKEN_KEY);
  }

  getToken() {
    return localStorage.getItem(USER_TOKEN_KEY);
  }
}

export default new AuthService();
