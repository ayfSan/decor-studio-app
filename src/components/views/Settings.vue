<template>
  <div class="p-4 md:p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Настройки</h1>

    <div class="max-w-2xl bg-white rounded-lg shadow-md overflow-hidden">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-700">
          Привязка аккаунта Telegram
        </h2>
        <p class="mt-2 text-gray-600">
          Привяжите ваш аккаунт Telegram для получения уведомлений о новых
          задачах и событиях.
        </p>
      </div>

      <div class="px-6 pb-6">
        <!-- Сообщение об успехе -->
        <div
          v-if="isLinked"
          class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md"
        >
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-3">verified_user</span>
            <div>
              <p class="font-bold">Аккаунт Telegram успешно привязан.</p>
              <p class="text-sm">
                Ваш Chat ID: {{ userInfo.telegram_chat_id }}
              </p>
            </div>
          </div>
        </div>

        <!-- Генерация и отображение кода -->
        <div v-else>
          <div
            v-if="linkCode"
            class="bg-blue-100 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md"
            role="alert"
          >
            <div class="flex items-center">
              <span class="material-symbols-outlined mr-3">info</span>
              <div>
                <p class="font-bold">Ваш код для привязки:</p>
                <p
                  class="text-2xl font-mono tracking-widest my-2 py-2 px-4 bg-blue-200 rounded-md inline-block"
                >
                  {{ linkCode }}
                </p>
                <p class="text-sm mt-2">
                  Этот код действителен <strong>5 минут</strong>. Отправьте его
                  нашему Telegram-боту:
                  <a
                    :href="telegramBotLink"
                    target="_blank"
                    class="font-semibold text-blue-700 hover:underline"
                    >@dvad_decorstudio_bot</a
                  >.
                </p>
              </div>
            </div>
          </div>

          <button
            v-else
            @click="generateCode"
            :disabled="loading"
            class="btn-primary w-full sm:w-auto flex items-center justify-center"
          >
            <span
              v-if="loading"
              class="spinner-border mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ loading ? "Генерация..." : "Получить код для привязки" }}
          </button>
        </div>

        <div
          v-if="error"
          class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-4"
        >
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-3">error</span>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Другие секции настроек можно добавить здесь -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import apiService from "@/services/api.service";
import { useAuthStore } from "@/store/auth.store";
import NProgress from "nprogress";

const linkCode = ref(null);
const loading = ref(false);
const error = ref("");
const authStore = useAuthStore();
const userInfo = ref(authStore.user);

const telegramBotLink = "https://t.me/dvad_decorstudio_bot";

const isLinked = computed(
  () => userInfo.value && !!userInfo.value.telegram_chat_id
);

const generateCode = async () => {
  loading.value = true;
  error.value = "";
  NProgress.start();
  try {
    const response = await apiService.generateLinkCode();
    linkCode.value = response.data.code;
  } catch (err) {
    error.value =
      err.response?.data?.message || "Не удалось сгенерировать код.";
  } finally {
    loading.value = false;
    NProgress.done();
  }
};

const refreshUserData = async () => {
  NProgress.start();
  try {
    const response = await apiService.getMe();
    authStore.setUser(response.data.user);
    userInfo.value = response.data.user;
  } catch (err) {
    console.error("Failed to refresh user data:", err);
    error.value = "Не удалось обновить данные профиля.";
  } finally {
    NProgress.done();
  }
};

onMounted(() => {
  refreshUserData();
});
</script>

<style scoped>
.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  -webkit-animation: spinner-border 0.75s linear infinite;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}
</style>
