<template>
  <div class="login-page">
    <div class="login-card">
      <div class="card-header">
        <h3>Авторизация</h3>
        <p>Пожалуйста, введите ваши данные</p>
      </div>
      <form @submit.prevent="handleLogin" class="card-body">
        <div class="form-group">
          <label for="username">Логин</label>
          <div class="input-group">
            <span class="input-group-icon">
              <i class="fas fa-user"></i>
            </span>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-control"
              placeholder="например, i.ivanov"
              required
            />
          </div>
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <div class="input-group">
            <span class="input-group-icon">
              <i class="fas fa-lock"></i>
            </span>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Войти</span>
        </button>
        <div v-if="error" class="alert-error">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.store";

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    await authStore.login(username.value, password.value);
  } catch (err) {
    error.value =
      err.response?.data?.message || "Ошибка входа. Проверьте логин и пароль.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ece9e6, #ffffff);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  background-color: #007bff;
  color: white;
  padding: 2rem;
  text-align: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.card-header p {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.9;
}

.card-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.input-group {
  position: relative;
}

.input-group-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #aaa;
}

.form-control {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem; /* отступ для иконки */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.btn-login {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-login:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-login:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-login:disabled {
  background-color: #a0c3ff;
  cursor: not-allowed;
}

.alert-error {
  margin-top: 1.5rem;
  padding: 0.8rem 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  text-align: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
