<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Движение ДС</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить операцию</span>
      </button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Дата
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Транзакция
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Счет
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Категория
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Событие (ID)
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Примечание
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Приход
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Расход
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="cashflowItems.length === 0">
            <td
              colspan="10"
              class="px-6 py-4 border-b border-gray-200 text-sm text-center"
            >
              Нет данных для отображения
            </td>
          </tr>
          <tr
            v-for="item in cashflowItems"
            :key="item.idcashflow"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ item.idcashflow }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ formatDate(item.date) }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ item.transaction }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ getAccountName(item.account_cashflow_idaccount_cashflow) }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ getCategoryName(item.category_cashflow_idcategory_cashflow) }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ item.event_idevent }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ item.note }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm text-right">
              {{ formatCurrency(item.income) }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm text-right">
              {{ formatCurrency(item.expense) }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              <button
                @click="openEditModal(item)"
                class="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                @click="confirmDeleteItem(item)"
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
          {{ isEditMode ? "Редактировать операцию" : "Добавить операцию" }}
        </h2>
        <form
          @submit.prevent="saveItem"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label
              for="date"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Дата</label
            >
            <input
              type="datetime-local"
              id="date"
              v-model="currentItem.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label
              for="transaction"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Транзакция</label
            >
            <input
              type="text"
              id="transaction"
              v-model="currentItem.transaction"
              class="input-field"
            />
          </div>
          <div>
            <label
              for="account"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Счет</label
            >
            <select
              id="account"
              v-model="currentItem.account_cashflow_idaccount_cashflow"
              required
              class="input-field"
            >
              <option
                v-for="acc in accounts"
                :key="acc.idaccount_cashflow"
                :value="acc.idaccount_cashflow"
              >
                {{ acc.name }}
              </option>
            </select>
          </div>
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Категория</label
            >
            <select
              id="category"
              v-model="currentItem.category_cashflow_idcategory_cashflow"
              required
              class="input-field"
            >
              <option
                v-for="cat in categories"
                :key="cat.idcategory_cashflow"
                :value="cat.idcategory_cashflow"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label
              for="event"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Событие (ID)</label
            >
            <input
              type="number"
              id="event"
              v-model="currentItem.event_idevent"
              required
              class="input-field"
            />
          </div>
          <div>
            <label
              for="note"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Примечание</label
            >
            <input
              type="text"
              id="note"
              v-model="currentItem.note"
              class="input-field"
            />
          </div>
          <div>
            <label
              for="income"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Приход</label
            >
            <input
              type="number"
              step="0.01"
              id="income"
              v-model="currentItem.income"
              required
              class="input-field"
            />
          </div>
          <div>
            <label
              for="expense"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Расход</label
            >
            <input
              type="number"
              step="0.01"
              id="expense"
              v-model="currentItem.expense"
              required
              class="input-field"
            />
          </div>
          <div class="md:col-span-2 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              {{ isEditMode ? "Сохранить" : "Добавить" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Dummy data for accounts and categories - in a real app, these would be fetched
const accounts = ref([
  { idaccount_cashflow: 1, name: "Наличные RUB" },
  { idaccount_cashflow: 2, name: "Карта Сбербанк" },
  { idaccount_cashflow: 3, name: 'Расчетный счет ООО "Ромашка"' },
]);

const categories = ref([
  { idcategory_cashflow: 1, name: "Аренда оборудования" },
  { idcategory_cashflow: 2, name: "Транспортные расходы" },
  { idcategory_cashflow: 3, name: "Оплата подрядчикам" },
  { idcategory_cashflow: 4, name: "Материалы" },
]);

const cashflowItems = ref([
  {
    idcashflow: 1,
    date: "2024-05-20T10:00:00.000Z",
    transaction: "Оплата аренды зала",
    account_cashflow_idaccount_cashflow: 1,
    category_cashflow_idcategory_cashflow: 1,
    event_idevent: 101,
    note: "Предоплата 50%",
    income: "0.00",
    expense: "15000.00",
  },
  {
    idcashflow: 2,
    date: "2024-05-21T14:30:00.000Z",
    transaction: "Поступление от клиента",
    account_cashflow_idaccount_cashflow: 2,
    category_cashflow_idcategory_cashflow: 4, // Assuming "Материалы" is an income category here for example
    event_idevent: 102,
    note: "Полная оплата заказа #123",
    income: "50000.00",
    expense: "0.00",
  },
]);

const isModalOpen = ref(false);
const currentItem = ref({});
const isEditMode = ref(false);

const defaultItem = {
  date: new Date().toISOString().slice(0, 16),
  transaction: "",
  account_cashflow_idaccount_cashflow:
    accounts.value.length > 0 ? accounts.value[0].idaccount_cashflow : null,
  category_cashflow_idcategory_cashflow:
    categories.value.length > 0
      ? categories.value[0].idcategory_cashflow
      : null,
  event_idevent: null,
  note: "",
  income: "0.00",
  expense: "0.00",
};

function getAccountName(id) {
  const account = accounts.value.find((acc) => acc.idaccount_cashflow === id);
  return account ? account.name : "N/A";
}

function getCategoryName(id) {
  const category = categories.value.find(
    (cat) => cat.idcategory_cashflow === id
  );
  return category ? category.name : "N/A";
}

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

function formatCurrency(value) {
  const val = parseFloat(value);
  return isNaN(val) ? "0.00" : val.toFixed(2);
}

function openAddModal() {
  isEditMode.value = false;
  currentItem.value = {
    ...defaultItem,
    date: new Date().toISOString().slice(0, 16),
  };
  isModalOpen.value = true;
}

function openEditModal(item) {
  isEditMode.value = true;
  // Ensure date is in 'yyyy-MM-ddThh:mm' format for datetime-local input
  const dateForInput = item.date
    ? new Date(item.date).toISOString().slice(0, 16)
    : "";
  currentItem.value = { ...item, date: dateForInput };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveItem() {
  // Convert date back to ISO string or appropriate format for backend
  if (currentItem.value.date) {
    const localDate = new Date(currentItem.value.date);
    currentItem.value.date = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  }

  if (isEditMode.value) {
    const index = cashflowItems.value.findIndex(
      (i) => i.idcashflow === currentItem.value.idcashflow
    );
    if (index !== -1) {
      cashflowItems.value[index] = { ...currentItem.value };
    }
  } else {
    cashflowItems.value.push({ ...currentItem.value, idcashflow: Date.now() }); // Replace Date.now() with actual ID
  }
  closeModal();
}

function confirmDeleteItem(itemToDelete) {
  if (
    confirm(
      `Вы уверены, что хотите удалить операцию "${
        itemToDelete.transaction || "Без названия"
      }"?`
    )
  ) {
    deleteItem(itemToDelete);
  }
}

function deleteItem(itemToDelete) {
  cashflowItems.value = cashflowItems.value.filter(
    (i) => i.idcashflow !== itemToDelete.idcashflow
  );
}

onMounted(() => {
  // In a real app, fetch accounts and categories here if not already available
  // e.g., fetchAccounts(); fetchCategories();
});
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
</style>
