<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Пользователи системы</h1>
      <button @click="openAddModal" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить пользователя</span>
      </button>
    </div>

    <!-- Поиск -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по ФИО, username, Telegram ID..."
        class="input-field w-full md:w-1/2 lg:w-1/3"
      />
    </div>

    <div
      v-if="isLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="bg-white rounded-lg shadow-md h-64 animate-pulse"
      ></div>
    </div>

    <div
      v-else-if="loadingError"
      class="text-center py-10 text-red-500 bg-red-50 p-6 rounded-lg shadow-sm"
    >
      <p class="font-semibold text-lg mb-2">
        Ошибка при загрузке пользователей
      </p>
      <p>{{ loadingError }}</p>
      <button @click="loadUsers" class="mt-4 btn-primary">
        Попробовать снова
      </button>
    </div>

    <div
      v-else-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="users.length === 0">Нет пользователей для отображения.</p>
      <p v-else>Пользователи по вашему запросу не найдены.</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="user_item in paginatedItems"
          :key="user_item.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          <div class="p-4 bg-primary-50">
            <h3 class="font-semibold text-lg text-primary-700 truncate">
              {{ user_item.first_name || "" }} {{ user_item.last_name || "" }}
              <span
                v-if="!user_item.first_name && !user_item.last_name"
                class="text-gray-600 italic"
                >{{ user_item.username || "Пользователь без имени" }}</span
              >
            </h3>
            <p
              v-if="user_item.first_name || user_item.last_name"
              class="text-sm text-primary-600"
            >
              @{{ user_item.username }}
            </p>
          </div>
          <div class="p-4 space-y-2 flex-grow">
            <p class="text-sm">
              <strong class="font-medium">Роль:</strong>
              <span
                :class="getRoleClass(user_item.role)"
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                >{{ user_item.role || "Не указана" }}</span
              >
            </p>
            <p class="text-sm">
              <strong class="font-medium">Telegram ID:</strong>
              {{ user_item.telegram_chat_id || "Не привязан" }}
            </p>
            <p class="text-sm">
              <strong class="font-medium">Дата создания:</strong>
              {{ formatDate(user_item.created_at) }}
            </p>
          </div>
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <div class="flex justify-end space-x-3">
              <button
                @click="openEditModal(user_item)"
                class="btn-icon-text text-primary-600 hover:text-primary-800"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
                <span class="text-sm">Изменить</span>
              </button>
              <button
                @click="confirmDeleteItem(user_item.id)"
                class="btn-icon-text text-red-500 hover:text-red-700"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
                <span class="text-sm">Удалить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit User -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{
            isEditMode ? "Редактировать пользователя" : "Добавить пользователя"
          }}
        </h2>
        <form
          @submit.prevent="saveUser"
          class="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <div>
            <label for="telegram_id" class="label-form">Telegram ID</label>
            <input
              type="number"
              id="telegram_id"
              v-model.number="currentUser.telegram_id"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="username" class="label-form">Username (Telegram)</label>
            <input
              type="text"
              id="username"
              v-model="currentUser.username"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="first_name" class="label-form">Имя</label>
            <input
              type="text"
              id="first_name"
              v-model="currentUser.first_name"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="last_name" class="label-form">Фамилия</label>
            <input
              type="text"
              id="last_name"
              v-model="currentUser.last_name"
              class="input-field"
            />
          </div>
          <div v-if="!isEditMode">
            <label for="password" class="label-form">Пароль</label>
            <input
              type="password"
              id="password"
              v-model="currentUser.password"
              :required="!isEditMode"
              class="input-field"
              placeholder="Оставьте пустым, чтобы не менять"
            />
          </div>
          <div>
            <label for="role" class="label-form">Роль</label>
            <select id="role" v-model="currentUser.role" class="input-field">
              <option value="" disabled>Выберите роль</option>
              <option value="Администратор">Администратор</option>
              <option value="Менеджер">Менеджер</option>
              <option value="Сотрудник">Сотрудник</option>
            </select>
          </div>
          <div class="sm:col-span-2 mt-6 flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditMode ? "Сохранить" : "Добавить" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import apiService from "@/services/api.service";
import { useAuthStore } from "@/store/auth.store";
import NProgress from "nprogress";

const users = ref([]);
const isLoading = ref(true);
const loadingError = ref(null);
const searchQuery = ref("");
const isModalOpen = ref(false);
const currentUser = ref({});
const isEditMode = ref(false);
const itemsPerPage = 9;
const currentPage = ref(1);
const authStore = useAuthStore();

const defaultUser = {
  telegram_id: null,
  username: "",
  first_name: "",
  last_name: "",
  role: "Сотрудник",
  password: "",
};

async function loadUsers() {
  isLoading.value = true;
  loadingError.value = null;
  try {
    const response = await apiService.getUsers();
    users.value = response.data.data || [];
  } catch (error) {
    console.error("Failed to load users:", error);
    loadingError.value =
      "Произошла критическая ошибка при загрузке пользователей.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadUsers();
});

const filteredUsers = computed(() => {
  const usersArray = Array.isArray(users.value) ? users.value : [];
  if (!searchQuery.value) {
    return usersArray;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return usersArray.filter((user) =>
    Object.values(user).some((val) =>
      String(val).toLowerCase().includes(lowerSearchQuery)
    )
  );
});

const paginatedItems = computed(() => {
  const usersArray = filteredUsers.value || [];
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return usersArray.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

function openAddModal() {
  isEditMode.value = false;
  currentUser.value = { ...defaultUser };
  isModalOpen.value = true;
}

function openEditModal(user) {
  isEditMode.value = true;
  currentUser.value = { ...user };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  currentUser.value = {};
}

async function saveUser() {
  try {
    let response;
    if (isEditMode.value) {
      response = await apiService.updateUser(
        currentUser.value.id,
        currentUser.value
      );
    } else {
      response = await apiService.createUser(currentUser.value);
    }

    if (response.data.success) {
      closeModal();
      loadUsers();
    } else {
      alert(
        `Ошибка: ${
          response.data.message || "Не удалось сохранить пользователя."
        }`
      );
    }
  } catch (error) {
    console.error("Error saving user:", error);
    alert("Произошла критическая ошибка при сохранении пользователя.");
  }
}

function confirmDeleteItem(id) {
  if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
    deleteItem(id);
  }
}

async function deleteItem(id) {
  try {
    const response = await apiService.deleteUser(id);
    if (response.data.success) {
      loadUsers();
    } else {
      alert(
        `Ошибка удаления: ${
          response.data.message || "Не удалось удалить пользователя."
        }`
      );
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Произошла критическая ошибка при удалении пользователя.");
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}

function getRoleClass(role) {
  const roleClasses = {
    Администратор: "bg-red-100 text-red-800",
    Менеджер: "bg-yellow-100 text-yellow-800",
    Сотрудник: "bg-green-100 text-green-800",
  };
  return roleClasses[role] || "bg-gray-100 text-gray-800";
}
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-icon-text {
  @apply flex items-center space-x-1 transition-colors duration-200;
}
</style>
