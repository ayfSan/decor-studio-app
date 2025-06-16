<template>
  <div class="p-0">
    <div
      class="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"
    >
      <h1 class="text-3xl font-bold text-gray-800">
        Общий Учет Средств (Аналитика)
      </h1>
      <div class="w-full sm:w-auto">
        <label for="globalSearch" class="sr-only">Поиск по операциям</label>
        <input
          type="text"
          id="globalSearch"
          v-model="searchQuery"
          class="input-field w-full"
          placeholder="Поиск по описанию операции..."
        />
      </div>
    </div>

    <!-- Сводная статистика -->
    <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-green-100 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-green-700">Общий доход</h3>
        <p class="text-3xl font-semibold text-green-800 mt-1">
          {{ formatCurrency(totalIncome) }}
        </p>
      </div>
      <div class="bg-red-100 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-red-700">Общий расход</h3>
        <p class="text-3xl font-semibold text-red-800 mt-1">
          {{ formatCurrency(totalExpense) }}
        </p>
      </div>
      <div class="bg-primary-100 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-primary-700">
          Чистый денежный поток
        </h3>
        <p class="text-3xl font-semibold text-primary-800 mt-1">
          {{ formatCurrency(balance) }}
        </p>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-gray-200 p-6 rounded-lg shadow h-28 animate-pulse"
      ></div>
    </div>

    <!-- Фильтры и Поиск -->
    <div class="mb-6 p-4 bg-white shadow rounded-lg">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label for="filterCategory" class="label-form">Категория</label>
          <select
            id="filterCategory"
            v-model="filterCategory"
            class="input-field"
          >
            <option :value="null">Все категории</option>
            <option
              v-for="cat in cashflowCategories"
              :key="cat.idcategory_cashflow"
              :value="cat.idcategory_cashflow"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="filterType" class="label-form">Тип операции</label>
          <select id="filterType" v-model="filterType" class="input-field">
            <option :value="null">Все типы</option>
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </select>
        </div>
        <div>
          <label for="filterEvent" class="label-form">Мероприятие</label>
          <select
            id="filterEvent"
            v-model.number="filterEvent"
            class="input-field"
          >
            <option :value="null">Все мероприятия</option>
            <option
              v-for="event_item in events"
              :key="event_item.idevent"
              :value="event_item.idevent"
            >
              {{ event_item.project_name }}
            </option>
          </select>
        </div>
        <div>
          <label for="filterAccount" class="label-form">Счет</label>
          <select
            id="filterAccount"
            v-model.number="filterAccount"
            class="input-field"
          >
            <option :value="null">Все счета</option>
            <option
              v-for="account_item in accounts"
              :key="account_item.idaccount_cashflow"
              :value="account_item.idaccount_cashflow"
            >
              {{ account_item.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="filterStartDate" class="label-form">Дата С</label>
          <input
            type="date"
            id="filterStartDate"
            v-model="filterStartDate"
            class="input-field"
          />
        </div>
        <div>
          <label for="filterEndDate" class="label-form">Дата По</label>
          <input
            type="date"
            id="filterEndDate"
            v-model="filterEndDate"
            class="input-field"
          />
        </div>
        <div class="lg:col-span-2">
          <button @click="resetFilters" class="btn-secondary h-10 w-full">
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>

    <!-- Аналитика по категориям -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        Аналитика по категориям
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-medium text-gray-700 mb-3">
            Расходы по категориям
          </h3>
          <div v-if="isLoading" class="space-y-3">
            <div
              v-for="n in 3"
              :key="n"
              class="h-8 bg-gray-200 rounded animate-pulse"
            ></div>
          </div>
          <div v-else-if="expenseByCategory.length === 0" class="text-gray-500">
            Нет данных о расходах.
          </div>
          <div
            v-else
            v-for="item in expenseByCategory"
            :key="item.category"
            class="mb-3"
          >
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-600">{{
                getCategoryName(item.category_cashflow_idcategory_cashflow)
              }}</span>
              <span class="font-semibold text-red-600">{{
                formatCurrency(item.total)
              }}</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-red-500 h-2.5 rounded-full"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-medium text-gray-700 mb-3">
            Доходы по категориям
          </h3>
          <div v-if="isLoading" class="space-y-3">
            <div
              v-for="n in 3"
              :key="n"
              class="h-8 bg-gray-200 rounded animate-pulse"
            ></div>
          </div>
          <div v-else-if="incomeByCategory.length === 0" class="text-gray-500">
            Нет данных о доходах.
          </div>
          <div
            v-else
            v-for="item in incomeByCategory"
            :key="item.category"
            class="mb-3"
          >
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-600">{{
                getCategoryName(item.category_cashflow_idcategory_cashflow)
              }}</span>
              <span class="font-semibold text-green-600">{{
                formatCurrency(item.total)
              }}</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-green-500 h-2.5 rounded-full"
                :style="{ width: item.percentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Таблица транзакций -->
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <h2 class="text-2xl font-semibold text-gray-700 p-6">Все операции</h2>
      <div v-if="isLoading" class="p-6">
        <div class="h-40 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <table v-else class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-cell">Дата</th>
            <th class="th-cell">Тип</th>
            <th class="th-cell">Категория</th>
            <th class="th-cell">Описание</th>
            <th class="th-cell text-right">Сумма</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="5" class="td-cell text-center">
              Нет операций для отображения по заданным фильтрам.
            </td>
          </tr>
          <tr
            v-for="transaction in paginatedTransactions"
            :key="transaction.idcashflow"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ formatDate(transaction.date) }}</td>
            <td class="td-cell">
              <span
                :class="
                  transaction.income > 0 ? 'text-green-600' : 'text-red-600'
                "
              >
                {{ transaction.income > 0 ? "Доход" : "Расход" }}
              </span>
            </td>
            <td class="td-cell">
              {{
                getCategoryName(
                  transaction.category_cashflow_idcategory_cashflow
                )
              }}
            </td>
            <td class="td-cell">{{ transaction.transaction }}</td>
            <td
              class="td-cell text-right font-medium"
              :class="
                transaction.income > 0 ? 'text-green-700' : 'text-red-700'
              "
            >
              {{ transaction.income > 0 ? "+" : "-"
              }}{{
                formatCurrency(
                  transaction.income > 0
                    ? transaction.income
                    : transaction.expense
                )
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiService from "@/services/api.service";
import NProgress from "nprogress";

// Data
const allTransactions = ref([]);
const events = ref([]);
const accounts = ref([]);
const cashflowCategories = ref([]);
const isLoading = ref(true);
const loadingError = ref(null);

// Filters
const searchQuery = ref("");
const filterCategory = ref(null);
const filterType = ref(null);
const filterEvent = ref(null);
const filterAccount = ref(null);
const filterStartDate = ref("");
const filterEndDate = ref("");

async function loadData() {
  isLoading.value = true;
  NProgress.start();
  try {
    const [transactionsRes, eventsRes, accountsRes, categoriesRes] =
      await Promise.all([
        apiService.getCashflow(),
        apiService.getEvents(),
        apiService.getAccounts(),
        apiService.getCashflowCategories(),
      ]);
    allTransactions.value = transactionsRes.success ? transactionsRes.data : [];
    events.value = eventsRes.success ? eventsRes.data : [];
    accounts.value = accountsRes.success ? accountsRes.data : [];
    cashflowCategories.value = categoriesRes.success ? categoriesRes.data : [];
  } catch (error) {
    console.error("Failed to load analytics data:", error);
  } finally {
    isLoading.value = false;
    NProgress.done();
  }
}

onMounted(() => {
  loadInitialData();
});

const loadInitialData = async () => {
  isLoading.value = true;
  loadingError.value = null;
  try {
    const [transactionsRes, categoriesRes, accountsRes, eventsRes] =
      await Promise.all([
        apiService.getCashflow(),
        apiService.getCashflowCategories(),
        apiService.getCashflowAccounts(),
        apiService.getEvents(),
      ]);

    allTransactions.value = transactionsRes.data.data;
    cashflowCategories.value = categoriesRes.data.data;
    accounts.value = accountsRes.data.data;
    events.value = eventsRes.data.data;
  } catch (error) {
    console.error("Failed to load cash accounting data:", error);
    loadingError.value = "Не удалось загрузить данные для учета средств.";
  } finally {
    isLoading.value = false;
  }
};

const filteredTransactions = computed(() => {
  return allTransactions.value.filter((t) => {
    const transactionDate = new Date(t.date);
    const startDate = filterStartDate.value
      ? new Date(filterStartDate.value)
      : null;
    const endDate = filterEndDate.value ? new Date(filterEndDate.value) : null;

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    return (
      (!searchQuery.value ||
        t.transaction
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())) &&
      (!filterCategory.value ||
        t.category_cashflow_idcategory_cashflow === filterCategory.value) &&
      (!filterType.value ||
        (filterType.value === "income" ? t.income > 0 : t.expense > 0)) &&
      (!filterEvent.value || t.event_idevent === filterEvent.value) &&
      (!filterAccount.value ||
        t.account_cashflow_idaccount_cashflow === filterAccount.value) &&
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate)
    );
  });
});

const paginatedTransactions = computed(() => {
  // For now, no pagination, return all filtered. Can be added later.
  return filteredTransactions.value;
});

// Analytics
const totalIncome = computed(() =>
  filteredTransactions.value.reduce((sum, t) => sum + Number(t.income), 0)
);
const totalExpense = computed(() =>
  filteredTransactions.value.reduce((sum, t) => sum + Number(t.expense), 0)
);
const balance = computed(() => totalIncome.value - totalExpense.value);

const incomeByCategory = computed(() => {
  const byCategory = filteredTransactions.value
    .filter((t) => t.income > 0)
    .reduce((acc, t) => {
      acc[t.category_cashflow_idcategory_cashflow] =
        (acc[t.category_cashflow_idcategory_cashflow] || 0) + Number(t.income);
      return acc;
    }, {});

  return Object.entries(byCategory)
    .map(([category, total]) => ({
      category_cashflow_idcategory_cashflow: category,
      total,
      percentage: totalIncome.value > 0 ? (total / totalIncome.value) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
});

const expenseByCategory = computed(() => {
  const byCategory = filteredTransactions.value
    .filter((t) => t.expense > 0)
    .reduce((acc, t) => {
      acc[t.category_cashflow_idcategory_cashflow] =
        (acc[t.category_cashflow_idcategory_cashflow] || 0) + Number(t.expense);
      return acc;
    }, {});

  return Object.entries(byCategory)
    .map(([category, total]) => ({
      category_cashflow_idcategory_cashflow: category,
      total,
      percentage:
        totalExpense.value > 0 ? (total / totalExpense.value) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
});

// Utils
function resetFilters() {
  searchQuery.value = "";
  filterCategory.value = null;
  filterType.value = null;
  filterEvent.value = null;
  filterAccount.value = null;
  filterStartDate.value = "";
  filterEndDate.value = "";
}

function getCategoryName(id) {
  const category = cashflowCategories.value.find(
    (c) => c.idcategory_cashflow == id
  );
  return category ? category.name : "Неизвестно";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("ru-RU");
}
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.th-cell {
  @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider;
}
.td-cell {
  @apply px-5 py-5 border-b border-gray-200 bg-white text-sm;
}
</style>
