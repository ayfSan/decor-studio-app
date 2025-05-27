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

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-cell">ID</th>
            <th class="th-cell">Наименование/ФИО</th>
            <th class="th-cell">Контактное лицо</th>
            <th class="th-cell">Телефон</th>
            <th class="th-cell">Telegram</th>
            <th class="th-cell">Примечания</th>
            <th class="th-cell">Действия</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="customers.length === 0">
            <td colspan="7" class="td-cell text-center">
              Нет данных для отображения
            </td>
          </tr>
          <tr
            v-for="customer in customers"
            :key="customer.idcustomer"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ customer.idcustomer }}</td>
            <td class="td-cell">{{ customer.name_customer }}</td>
            <td class="td-cell">{{ customer.contact_person }}</td>
            <td class="td-cell">{{ customer.phone }}</td>
            <td class="td-cell">{{ customer.telegram_username }}</td>
            <td class="td-cell">{{ customer.notes }}</td>
            <td class="td-cell">
              <button
                @click="openEditModal(customer)"
                class="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                @click="confirmDeleteItem(customer)"
                class="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
import { ref } from "vue";

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

const isModalOpen = ref(false);
const currentCustomer = ref({});
const isEditMode = ref(false);

const defaultCustomer = {
  name_customer: "",
  contact_person: "",
  phone: "",
  telegram_username: "",
  notes: "",
};

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
    customers.value.push({ ...currentCustomer.value, idcustomer: Date.now() }); // Replace with actual ID
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
  @apply px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm;
}
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm;
}
</style>
