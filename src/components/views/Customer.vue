<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Клиенты</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
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
      v-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="customers.length === 0">Нет клиентов для отображения.</p>
      <p v-else>
        Клиенты по вашему запросу не найдены или нет данных на этой странице.
      </p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="customer in paginatedItems"
          :key="customer.idcustomer"
          class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          <!-- Заголовок -->
          <div class="p-4 bg-primary-50">
            <h3 class="font-semibold text-lg text-primary-700">
              {{ customer.name_customer || "Клиент без имени" }}
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              ID: {{ customer.idcustomer }}
            </p>
          </div>

          <!-- Основной контент -->
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

          <!-- Футер с кнопками -->
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
                @click="confirmDeleteItem(customer)"
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
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"
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
import { ref, computed, watch } from "vue";

const customers = ref([
  {
    idcustomer: 1,
    name_customer: 'ООО "Праздник Плюс"',
    contact_person: "Иванов Иван",
    phone: "+79001234567",
    telegram_username: "@ivanov_event",
    notes: "Постоянный клиент, предпочитает безналичный расчет",
  },
  {
    idcustomer: 2,
    name_customer: "Анна Петрова",
    contact_person: "Анна Петрова",
    phone: "+79017654321",
    telegram_username: "@anna_p",
    notes: "Заказ на свадьбу, высокий бюджет",
  },
]);

const searchQuery = ref("");
const isModalOpen = ref(false);
const currentCustomer = ref({});
const isEditMode = ref(false);
const itemsPerPage = 9;
const currentPage = ref(1);

const defaultCustomer = {
  name_customer: "",
  contact_person: "",
  phone: "",
  telegram_username: "",
  notes: "",
};

const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return customers.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return customers.value.filter((customer) => {
    const nameMatch = (customer.name_customer || "")
      .toLowerCase()
      .includes(lowerSearchQuery);
    const contactPersonMatch = (customer.contact_person || "")
      .toLowerCase()
      .includes(lowerSearchQuery);
    const phoneMatch = (customer.phone || "")
      .toLowerCase()
      .includes(lowerSearchQuery);
    const telegramMatch = (customer.telegram_username || "")
      .toLowerCase()
      .includes(lowerSearchQuery);
    return nameMatch || contactPersonMatch || phoneMatch || telegramMatch;
  });
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
}

function saveCustomer() {
  if (isEditMode.value) {
    const index = customers.value.findIndex(
      (c) => c.idcustomer === currentCustomer.value.idcustomer
    );
    if (index !== -1) {
      customers.value[index] = { ...currentCustomer.value };
    }
  } else {
    // Simulate ID generation
    currentCustomer.value.idcustomer =
      customers.value.length > 0
        ? Math.max(...customers.value.map((c) => c.idcustomer)) + 1
        : 1;
    customers.value.push({ ...currentCustomer.value });
  }
  closeModal();
}

function confirmDeleteItem(customer) {
  if (
    confirm(
      `Вы уверены, что хотите удалить клиента "${customer.name_customer}"?`
    )
  ) {
    deleteCustomer(customer);
  }
}

function deleteCustomer(customerToDelete) {
  customers.value = customers.value.filter(
    (c) => c.idcustomer !== customerToDelete.idcustomer
  );
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
