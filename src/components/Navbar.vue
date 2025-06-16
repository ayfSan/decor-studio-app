<template>
  <div
    class="bg-white border-r border-gray-200 w-64 h-screen shadow-lg flex flex-col"
    @click.stop
  >
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-800">Навигация</h2>
    </div>

    <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <router-link
        to="/"
        class="nav-link"
        :class="{ 'active-link': $route.path === '/' }"
        @click="$emit('close-menu')"
      >
        <span class="material-symbols-outlined text-primary-600 mr-3"
          >home</span
        >
        <span>Главная</span>
      </router-link>

      <router-link
        to="/events"
        class="nav-link"
        :class="{ 'active-link': $route.path === '/events' }"
        @click="$emit('close-menu')"
      >
        <span class="material-symbols-outlined text-primary-600 mr-3"
          >event</span
        >
        <span>Мероприятия</span>
      </router-link>

      <router-link
        to="/members"
        class="nav-link"
        :class="{ 'active-link': $route.path === '/members' }"
        @click="$emit('close-menu')"
      >
        <span class="material-symbols-outlined text-primary-600 mr-3"
          >groups</span
        >
        <span>Участники</span>
      </router-link>

      <router-link
        to="/cash"
        class="nav-link"
        :class="{
          'active-link':
            $route.path === '/cash' || $route.path === '/analytics',
        }"
        @click="$emit('close-menu')"
      >
        <span class="material-symbols-outlined text-primary-600 mr-3"
          >analytics</span
        >
        <span>Аналитика</span>
      </router-link>

      <!-- Финансовый раздел -->
      <div class="pt-3">
        <h3 class="nav-section-title">Финансы</h3>
        <router-link
          to="/finance/operations"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith('/finance/operations'),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >receipt_long</span
          >
          <span>Движение ДС</span>
        </router-link>
        <router-link
          to="/finance/accounts"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith('/finance/accounts'),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >account_balance_wallet</span
          >
          <span>Счета ДС</span>
        </router-link>
        <router-link
          to="/finance/categories"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith('/finance/categories'),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >category</span
          >
          <span>Категории ДС</span>
        </router-link>
      </div>

      <!-- Справочники -->
      <div class="pt-3">
        <h3 class="nav-section-title">Справочники</h3>
        <router-link
          to="/directory/customers"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith('/directory/customers'),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >contacts</span
          >
          <span>Клиенты</span>
        </router-link>
        <router-link
          to="/directory/venues"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith('/directory/venues'),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >place</span
          >
          <span>Места проведения</span>
        </router-link>
        <router-link
          to="/directory/event-categories"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith(
              '/directory/event-categories'
            ),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >theater_comedy</span
          >
          <span>Категории мероприятий</span>
        </router-link>
        <router-link
          to="/directory/documents"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith('/directory/documents'),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >article</span
          >
          <span>Документы</span>
        </router-link>
        <router-link
          to="/directory/document-templates"
          class="nav-link"
          :class="{
            'active-link': $route.path.startsWith(
              '/directory/document-templates'
            ),
          }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >file_present</span
          >
          <span>Шаблоны документов</span>
        </router-link>
      </div>

      <!-- Администрирование -->
      <div class="pt-3">
        <h3 class="nav-section-title">Администрирование</h3>
        <router-link
          to="/admin/users"
          class="nav-link"
          :class="{ 'active-link': $route.path.startsWith('/admin/users') }"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-primary-600 mr-3"
            >manage_accounts</span
          >
          <span>Пользователи</span>
        </router-link>
      </div>
    </nav>

    <div class="bg-white">
      <div class="p-4 border-t border-gray-200">
        <div class="rounded-lg p-4 bg-primary-50 shadow-sm">
          <h3 class="font-semibold text-primary-700 mb-3">Ближайшие события</h3>
          <div
            v-if="displayUpcomingEvents.length"
            class="text-sm text-gray-700 space-y-2"
          >
            <div
              v-for="event_item in displayUpcomingEvents"
              :key="event_item.idevent"
            >
              <router-link
                :to="{
                  name: 'EventDetail',
                  params: { eventId: event_item.idevent },
                }"
                @click="$emit('close-menu')"
                class="hover:underline"
              >
                <p class="font-medium">
                  • {{ event_item.project_name || "Мероприятие" }}
                </p>
                <p class="text-xs text-primary-600 ml-3">
                  {{ formatDate(event_item.date) }}
                </p>
              </router-link>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">Нет ближайших событий.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import apiService from "@/services/api.service.js";
import { useAuthStore } from "@/store/auth.store";

defineEmits(["close-menu"]);

const upcomingEvents = ref([]);
const authStore = useAuthStore();

async function fetchUpcomingEvents() {
  // Загружаем события, только если пользователь аутентифицирован
  if (!authStore.isAuthenticated) {
    upcomingEvents.value = []; // Очищаем список, если пользователь вышел
    return;
  }

  try {
    const res = await apiService.getUpcomingEvents();
    // Ответ axios содержит данные в поле `data`
    if (res.data.success) {
      upcomingEvents.value = res.data.data;
    } else {
      console.error(
        "Failed to load upcoming events for navbar:",
        res.data.message
      );
    }
  } catch (error) {
    // Не выводим ошибку 401 в консоль, т.к. это ожидаемое поведение при выходе
    if (error.response?.status !== 401) {
      console.error("Failed to load upcoming events for navbar:", error);
    }
  }
}

// Загружаем данные при монтировании компонента, если пользователь уже вошел
onMounted(fetchUpcomingEvents);

// И следим за изменением статуса аутентификации
// Например, когда пользователь входит в систему, isAuthenticated станет true, и мы загрузим данные
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      fetchUpcomingEvents();
    } else {
      // Если пользователь вышел, очищаем список
      upcomingEvents.value = [];
    }
  },
  { immediate: true }
); // immediate: true вызовет обработчик сразу при инициализации

const displayUpcomingEvents = computed(() => {
  return upcomingEvents.value.slice(0, 5); // Показываем не более 5
});

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = {
    month: "long",
    day: "numeric",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", options);
}
</script>

<style scoped>
.nav-link {
  @apply flex px-3 py-2 rounded-lg transition-colors duration-150 items-center text-gray-700 hover:bg-primary-50 text-sm;
}
.active-link {
  @apply bg-primary-100 text-primary-700 font-semibold;
}
.nav-section-title {
  @apply px-3 pt-2 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider;
}
</style>
