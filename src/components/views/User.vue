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

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-cell">ID</th>
            <th class="th-cell">Telegram ID</th>
            <th class="th-cell">Username</th>
            <th class="th-cell">Имя</th>
            <th class="th-cell">Фамилия</th>
            <th class="th-cell">Роль</th>
            <th class="th-cell">Дата создания</th>
            <th class="th-cell">Действия</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="users.length === 0">
            <td colspan="8" class="td-cell text-center">
              Нет данных для отображения
            </td>
          </tr>
          <tr
            v-for="user_item in users"
            :key="user_item.id"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ user_item.id }}</td>
            <td class="td-cell">{{ user_item.telegram_id }}</td>
            <td class="td-cell">{{ user_item.username }}</td>
            <td class="td-cell">{{ user_item.first_name }}</td>
            <td class="td-cell">{{ user_item.last_name || "-" }}</td>
            <td class="td-cell">{{ user_item.role || "-" }}</td>
            <td class="td-cell">{{ formatDate(user_item.created_at) }}</td>
            <td class="td-cell">
              <button
                @click="openEditModal(user_item)"
                class="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                @click="confirmDeleteItem(user_item)"
                class="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
            <input
              type="text"
              id="role"
              v-model="currentUser.role"
              class="input-field"
              placeholder="Например, Администратор"
            />
            <!-- TODO: Можно заменить на select с предопределенными ролями -->
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
import { ref } from "vue";

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

const isModalOpen = ref(false);
const currentUser = ref({});
const isEditMode = ref(false);

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
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}

function openAddModal() {
  isEditMode.value = false;
  currentUser.value = { ...defaultUser };
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
  @apply px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm;
}
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm;
}
</style>
