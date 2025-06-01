<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Пользователи системы</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
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
      v-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="users.length === 0">Нет пользователей для отображения.</p>
      <p v-else>
        Пользователи по вашему запросу не найдены или нет данных на этой
        странице.
      </p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="user_item in paginatedItems"
          :key="user_item.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          <!-- Заголовок -->
          <div class="p-4 bg-primary-50">
            <h3 class="font-semibold text-lg text-primary-700 truncate">
              {{ user_item.first_name || "" }} {{ user_item.last_name || "" }}
              <span
                v-if="!user_item.first_name && !user_item.last_name"
                class="text-gray-600 italic"
              >
                {{ user_item.username || "Пользователь без имени" }}
              </span>
            </h3>
            <p
              v-if="user_item.first_name || user_item.last_name"
              class="text-sm text-primary-600"
            >
              @{{ user_item.username }}
            </p>
            <p class="text-xs text-gray-500 mt-1">ID: {{ user_item.id }}</p>
          </div>

          <!-- Основной контент -->
          <div class="p-4 space-y-2 flex-grow">
            <p class="text-sm">
              <strong class="font-medium">Роль:</strong>
              <span
                :class="getRoleClass(user_item.role)"
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
              >
                {{ user_item.role || "Не указана" }}
              </span>
            </p>
            <p class="text-sm">
              <strong class="font-medium">Telegram ID:</strong>
              {{ user_item.telegram_id }}
            </p>
            <p class="text-sm">
              <strong class="font-medium">Дата создания:</strong>
              {{ formatDate(user_item.created_at) }}
            </p>
          </div>

          <!-- Футер с кнопками -->
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
                @click="confirmDeleteItem(user_item)"
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
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
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
          <div>
            <label for="role" class="label-form">Роль</label>
            <select id="role" v-model="currentUser.role" class="input-field">
              <option value="" disabled>Выберите роль</option>
              <option value="Администратор">Администратор</option>
              <option value="Менеджер">Менеджер</option>
              <option value="Сотрудник">Сотрудник</option>
              <!-- Добавьте другие роли по необходимости -->
            </select>
          </div>

          <div v-if="isEditMode" class="sm:col-span-2">
            <label class="label-form">Дата создания</label>
            <p class="mt-1 text-sm text-gray-700">
              {{ formatDate(currentUser.created_at) }}
            </p>
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
import { ref, computed, watch } from "vue";

const users = ref([
  {
    id: 1,
    telegram_id: 1020152129,
    username: "cammbucho",
    first_name: "ИП Дачница Баба Дуся",
    last_name: null,
    role: "Администратор",
    created_at: "2025-05-19T01:43:04.680Z",
  },
  {
    id: 2,
    telegram_id: 123456789,
    username: "test_user",
    first_name: "Тестовый",
    last_name: "Пользователь",
    role: "Менеджер",
    created_at: "2024-01-10T10:00:00.000Z",
  },
]);

const searchQuery = ref("");
const isModalOpen = ref(false);
const currentUser = ref({});
const isEditMode = ref(false);
const itemsPerPage = 9;
const currentPage = ref(1);

const defaultUser = {
  telegram_id: null,
  username: "",
  first_name: "",
  last_name: "",
  role: "",
};

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

function openAddModal() {
  isEditMode.value = false;
  currentUser.value = {
    ...defaultUser,
    role: "",
  };
  isModalOpen.value = true;
}

function openEditModal(user_item) {
  isEditMode.value = true;
  currentUser.value = { ...user_item };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveUser() {
  if (isEditMode.value) {
    const index = users.value.findIndex((u) => u.id === currentUser.value.id);
    if (index !== -1) {
      users.value[index] = { ...currentUser.value };
    }
  } else {
    // For new users, created_at should be set by the backend. Here, we simulate it.
    users.value.push({
      ...currentUser.value,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }); // Replace with actual ID
  }
  closeModal();
}

function confirmDeleteItem(user_item) {
  if (
    confirm(
      `Вы уверены, что хотите удалить пользователя "${user_item.first_name} ${
        user_item.last_name || ""
      } (${user_item.username})"?`
    )
  ) {
    deleteUser(user_item);
  }
}

function deleteUser(userToDelete) {
  users.value = users.value.filter((u) => u.id !== userToDelete.id);
}

const getRoleClass = (role) => {
  switch (role) {
    case "Администратор":
      return "bg-red-100 text-red-700";
    case "Менеджер":
      return "bg-yellow-100 text-yellow-700";
    case "Сотрудник":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return users.value.filter((user) => {
    const fullNameMatch =
      (user.first_name || "") +
      " " +
      (user.last_name || "").toLowerCase().includes(lowerSearchQuery);
    const usernameMatch = (user.username || "")
      .toLowerCase()
      .includes(lowerSearchQuery);
    const telegramIdMatch = (user.telegram_id ? String(user.telegram_id) : "")
      .toLowerCase()
      .includes(lowerSearchQuery);
    return fullNameMatch || usernameMatch || telegramIdMatch;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage);
});

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredUsers.value.slice(startIndex, endIndex);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

function nextPage() {
  // ... existing code ...
}
</script>

<style scoped>
.th-cell {
  @apply px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider;
}
.td-cell {
  @apply px-6 py-4 border-b border-gray-200 text-sm;
}
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center;
}
.btn-icon-text {
  @apply flex items-center space-x-1 transition-colors duration-200;
}
</style>
