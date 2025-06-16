<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/api.service.js";
import { useAuthStore } from "@/store/auth.store";

const router = useRouter();
const authStore = useAuthStore();

// Для хранения всех участников (и юзеров, и контактов)
const members = ref([]);
// Для формы добавления/редактирования (работаем только с контактами)
const newContact = ref({ name: "", specialty: "", phone: "", notes: "" });
const currentEditContact = ref(null);

// Состояния UI
const showAddContactForm = ref(false);
const isEditModalOpen = ref(false);
const isLoading = ref(true);
const searchTerm = ref("");

// Загрузка данных
async function loadMembers() {
  isLoading.value = true;
  try {
    const response = await apiService.getParticipants();
    members.value = response.data.data;
  } catch (error) {
    console.error("Error loading members:", error);
    // Можно добавить обработку ошибки для пользователя
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadMembers();
});

// Фильтрация
const filteredMembers = computed(() => {
  if (!searchTerm.value) {
    return members.value;
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return members.value.filter(
    (member) =>
      member.name?.toLowerCase().includes(lowerCaseSearch) ||
      member.role?.toLowerCase().includes(lowerCaseSearch) ||
      member.type?.toLowerCase().includes(lowerCaseSearch)
  );
});

// Логика добавления
const addContact = async () => {
  try {
    const response = await apiService.createContact(newContact.value);
    if (response.success) {
      await loadMembers();
      showAddContactForm.value = false;
      newContact.value = { name: "", specialty: "", phone: "", notes: "" };
    } else {
      alert(`Ошибка: ${response.message}`);
    }
  } catch (error) {
    console.error("Error creating contact:", error);
    alert("Произошла критическая ошибка при создании контакта.");
  }
};

// Логика редактирования
function handleEdit(member) {
  if (member.type === "Сотрудник") {
    router.push({ name: "UserManagement" });
  } else {
    currentEditContact.value = { ...member };
    isEditModalOpen.value = true;
  }
}

function closeEditModal() {
  isEditModalOpen.value = false;
  currentEditContact.value = null;
}

async function saveEditedContact() {
  if (!currentEditContact.value) return;
  try {
    const { id, name, specialty, phone, notes } = currentEditContact.value;
    const response = await apiService.updateContact(id, {
      name,
      specialty,
      phone,
      notes,
    });
    if (response.success) {
      await loadMembers();
      closeEditModal();
    } else {
      alert(`Ошибка: ${response.message}`);
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    alert("Произошла критическая ошибка при обновлении контакта.");
  }
}

// Логика удаления
const deleteItem = async (member) => {
  const confirmMessage = `Вы уверены, что хотите удалить "${member.name}"?`;
  if (!confirm(confirmMessage)) return;

  try {
    let response;
    if (member.type === "Сотрудник") {
      response = await apiService.deleteUser(member.id);
    } else {
      response = await apiService.deleteContact(member.id);
    }

    if (response.success) {
      await loadMembers();
    } else {
      console.error("Failed to delete item:", response.message);
      alert(`Не удалось удалить. ${response.message}`);
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Произошла критическая ошибка при удалении.");
  }
};
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
    >
      <h1 class="text-3xl font-bold text-gray-800">Участники</h1>
      <div class="flex items-center gap-2">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Поиск..."
          class="input-field-sm"
        />
        <button
          @click="showAddContactForm = true"
          class="btn-primary flex-shrink-0"
        >
          <span class="material-symbols-outlined md:mr-2">person_add</span>
          <span class="hidden md:inline">Добавить специалиста</span>
        </button>
      </div>
    </div>

    <!-- Форма добавления контакта -->
    <div
      v-if="showAddContactForm"
      class="mb-6 bg-white rounded-lg shadow-xl p-6"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-gray-700">Новый специалист</h2>
        <button @click="showAddContactForm = false" class="btn-icon">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <form @submit.prevent="addContact" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="label-form">Имя</label>
            <input
              v-model="newContact.name"
              type="text"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="label-form">Специальность</label>
            <input
              v-model="newContact.specialty"
              type="text"
              class="input-field"
            />
          </div>
          <div>
            <label class="label-form">Телефон</label>
            <input v-model="newContact.phone" type="tel" class="input-field" />
          </div>
          <div>
            <label class="label-form">Заметки</label>
            <input v-model="newContact.notes" type="text" class="input-field" />
          </div>
        </div>
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showAddContactForm = false"
            class="btn-secondary"
          >
            Отмена
          </button>
          <button type="submit" class="btn-primary">Добавить</button>
        </div>
      </form>
    </div>

    <!-- Loading and Empty States -->
    <div v-if="isLoading" class="text-center p-10 text-gray-500">
      Загрузка...
    </div>
    <div
      v-else-if="filteredMembers.length === 0"
      class="text-center p-10 bg-white rounded-lg shadow-sm"
    >
      <p class="font-semibold">Участники не найдены</p>
      <p class="text-sm text-gray-600">
        Попробуйте изменить условия поиска или добавьте нового специалиста.
      </p>
    </div>

    <!-- Members List (Responsive) -->
    <div v-else class="space-y-4">
      <div
        v-for="member in filteredMembers"
        :key="member.uniqueId"
        class="bg-white rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div
          class="flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-center"
        >
          <!-- Name -->
          <div class="col-span-2 sm:col-span-1">
            <div class="font-bold text-lg text-primary-700">
              {{ member.name }}
            </div>
            <div class="text-sm text-gray-500 md:hidden">{{ member.role }}</div>
          </div>
          <!-- Role/Specialty (hidden on mobile) -->
          <div class="hidden md:block text-gray-600">{{ member.role }}</div>
          <!-- Type (hidden on mobile) -->
          <div class="hidden md:block">
            <span
              :class="[
                'px-3 py-1 text-xs font-semibold rounded-full',
                member.type === 'Сотрудник'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800',
              ]"
            >
              {{ member.type }}
            </span>
          </div>
          <!-- Phone (visible on mobile too) -->
          <div class="text-gray-600">{{ member.phone }}</div>
        </div>

        <!-- Actions -->
        <div
          class="flex-shrink-0 flex items-center justify-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0"
        >
          <button
            @click="handleEdit(member)"
            class="btn-icon"
            title="Редактировать"
          >
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button
            @click="deleteItem(member)"
            class="btn-icon-danger"
            title="Удалить"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6">Редактировать специалиста</h2>
        <form @submit.prevent="saveEditedContact" class="space-y-4">
          <div>
            <label class="label-form">Имя</label>
            <input
              v-model="currentEditContact.name"
              type="text"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="label-form">Специальность</label>
            <input
              v-model="currentEditContact.specialty"
              type="text"
              class="input-field"
            />
          </div>
          <div>
            <label class="label-form">Телефон</label>
            <input
              v-model="currentEditContact.phone"
              type="tel"
              class="input-field"
            />
          </div>
          <div>
            <label class="label-form">Заметки</label>
            <input
              v-model="currentEditContact.notes"
              type="text"
              class="input-field"
            />
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeEditModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-sort {
  @apply px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors;
}
.active-sort {
  @apply bg-primary-100 text-primary-700 font-semibold;
}
.th-table {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none;
}
.td-table {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}
.btn-primary {
  @apply px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}
</style>
