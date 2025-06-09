<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800">Вход в систему</h1>
        <p class="mt-2 text-gray-600">Добро пожаловать!</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="label-form">Имя пользователя</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="input-field"
            placeholder="Ваш логин"
          />
        </div>

        <div>
          <label for="password" class="label-form">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="input-field"
            placeholder="Ваш пароль"
          />
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <button type="submit" class="w-full btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Вход...
          </span>
          <span v-else>Войти</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/auth.service.js";

const router = useRouter();
const username = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const success = await authService.login(username.value, password.value);
    if (success) {
      router.push("/");
    } else {
      errorMessage.value = "Неверное имя пользователя или пароль.";
    }
  } catch (error) {
    errorMessage.value = error.message || "Произошла ошибка при попытке входа.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex justify-center;
}
</style>
