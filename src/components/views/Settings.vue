<template>
  <div class="container mt-4">
    <h2>Настройки профиля</h2>

    <div class="card mt-4">
      <div class="card-header">Привязка аккаунта Telegram</div>
      <div class="card-body">
        <p>
          Привяжите ваш аккаунт Telegram для получения уведомлений о новых
          задачах и событиях.
        </p>

        <div v-if="linkCode" class="alert alert-info">
          <p>Ваш код для привязки (действителен 5 минут):</p>
          <h3 class="text-center font-weight-bold">{{ linkCode }}</h3>
          <p class="mt-2">
            Отправьте этот код нашему боту
            <a :href="telegramBotLink" target="_blank">@YourCompanyBot</a>.
          </p>
        </div>

        <div
          v-if="userInfo && userInfo.telegram_chat_id"
          class="alert alert-success"
        >
          <i class="fas fa-check-circle"></i> Ваш аккаунт Telegram успешно
          привязан.
        </div>

        <button
          v-if="!linkCode && !(userInfo && userInfo.telegram_chat_id)"
          class="btn btn-primary"
          @click="generateCode"
          :disabled="loading"
        >
          {{ loading ? "Генерация..." : "Получить код для привязки" }}
        </button>

        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Здесь можно добавить другие секции настроек -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiService from "@/services/api.service";
import { useAuthStore } from "@/store/auth.store";

const linkCode = ref(null);
const loading = ref(false);
const error = ref("");
const authStore = useAuthStore();
const userInfo = ref(null); // Пока не получаем актуальные данные, но задел есть

const telegramBotLink = "https://t.me/YourCompanyBot"; // Заменить на реальную ссылку

const generateCode = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await apiService.generateLinkCode();
    linkCode.value = response.data.code;
  } catch (err) {
    error.value =
      err.response?.data?.message || "Не удалось сгенерировать код.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // В будущем, при загрузке страницы, нужно будет получать актуальные данные пользователя,
  // чтобы проверить, привязан ли уже Telegram.
  // Например, через /api/auth/me, который нужно будет дополнить информацией о telegram_chat_id
  userInfo.value = authStore.currentUser;
});
</script>

<style scoped>
.card {
  max-width: 600px;
}
</style>
