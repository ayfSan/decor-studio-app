<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Клиенты</h1>
      <button @click="openAddModal" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить клиента</span>
      </button>
    </div>

    <!-- Поиск -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по имени, контактам..."
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
      v-else-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="customers.length === 0">
        Нет клиентов для отображения. Нажмите "Добавить", чтобы создать нового
        клиента.
      </p>
      <p v-else>Клиенты по вашему запросу не найдены.</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="customer in paginatedItems"
          :key="customer.idcustomer"
          class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          <div class="p-4 bg-primary-50">
            <h3 class="font-semibold text-lg text-primary-700">
              {{ customer.name_customer || "Клиент без имени" }}
            </h3>
          </div>
          <div class="p-4 space-y-2 flex-grow">
            <p v-if="customer.contact_person" class="text-sm">
              <strong class="font-medium">Конт. лицо:</strong>
              {{ customer.contact_person }}
            </p>
            <p v-if="customer.phone" class="text-sm">
              <strong class="font-medium">Телефон:</strong> {{ customer.phone }}
            </p>
            <p v-if="customer.telegram_username" class="text-sm">
              <strong class="font-medium">Telegram:</strong>
              {{ customer.telegram_username }}
            </p>
            <p
              v-if="customer.notes"
              class="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100"
            >
              <strong class="font-medium">Примечания:</strong><br />{{
                customer.notes
              }}
            </p>
          </div>
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <div class="flex justify-end space-x-3">
              <button
                @click="openEditModal(customer)"
                class="btn-icon-text text-primary-600 hover:text-primary-800"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
                <span class="text-sm">Изменить</span>
              </button>
              <button
                @click="confirmDeleteItem(customer.idcustomer)"
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

    <!-- Modal for Add/Edit -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6">
          {{ isEditMode ? "Редактировать клиента" : "Добавить клиента" }}
        </h2>
        <form
          @submit.prevent="saveCustomer"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label for="name_customer" class="label-form"
              >Наименование/ФИО</label
            >
            <input
              type="text"
              id="name_customer"
              v-model="currentCustomer.name_customer"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="contact_person" class="label-form"
              >Контактное лицо</label
            >
            <input
              type="text"
              id="contact_person"
              v-model="currentCustomer.contact_person"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="phone" class="label-form">Телефон</label>
            <input
              type="tel"
              id="phone"
              v-model="currentCustomer.phone"
              class="input-field"
            />
          </div>
          <div>
            <label for="telegram_username" class="label-form">Telegram</label>
            <input
              type="text"
              id="telegram_username"
              v-model="currentCustomer.telegram_username"
              class="input-field"
            />
          </div>
          <div class="md:col-span-2">
            <label for="notes" class="label-form">Примечания</label>
            <textarea
              id="notes"
              v-model="currentCustomer.notes"
              rows="3"
              class="input-field"
            ></textarea>
          </div>
          <div class="md:col-span-2 mt-6 flex justify-end space-x-3">
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

const customers = ref([]);
const isLoading = ref(true);
const searchQuery = ref("");
const isModalOpen = ref(false);
const currentCustomer = ref({});
const isEditMode = ref(false);
const itemsPerPage = 9;
const currentPage = ref(1);
const authStore = useAuthStore();

const defaultCustomer = {
  name_customer: "",
  contact_person: "",
  phone: "",
  telegram_username: "",
  notes: "",
};

async function loadCustomers() {
  isLoading.value = true;
  try {
    const response = await apiService.getCustomers();
    customers.value = response.data.data;
  } catch (error) {
    console.error("Error loading customers:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadCustomers();
});

const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return customers.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return customers.value.filter((customer) =>
    Object.values(customer).some((val) =>
      String(val).toLowerCase().includes(lowerSearchQuery)
    )
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / itemsPerPage);
});

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredCustomers.value.slice(startIndex, endIndex);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

function openAddModal() {
  isEditMode.value = false;
  currentCustomer.value = { ...defaultCustomer };
  isModalOpen.value = true;
}

function openEditModal(customer) {
  isEditMode.value = true;
  currentCustomer.value = { ...customer };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  currentCustomer.value = {};
}

async function saveCustomer() {
  try {
    let response;
    if (isEditMode.value) {
      response = await apiService.updateCustomer(
        currentCustomer.value.idcustomer,
        currentCustomer.value
      );
    } else {
      response = await apiService.createCustomer(currentCustomer.value);
    }

    if (response.data.success) {
      closeModal();
      loadCustomers();
    } else {
      alert(
        `Ошибка: ${response.data.message || "Не удалось сохранить клиента."}`
      );
    }
  } catch (error) {
    console.error("Error saving customer:", error);
    alert("Произошла критическая ошибка при сохранении.");
  }
}

async function confirmDeleteItem(id) {
  if (
    confirm(
      "Вы уверены, что хотите удалить этого клиента? Это действие необратимо."
    )
  ) {
    NProgress.start();
    try {
      const response = await apiService.deleteCustomer(id);
      if (response.data.success) {
        loadCustomers();
      } else {
        alert(
          `Ошибка удаления: ${
            response.data.message || "Не удалось удалить клиента."
          }`
        );
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Произошла критическая ошибка при удалении.");
    } finally {
      NProgress.done();
    }
  }
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
