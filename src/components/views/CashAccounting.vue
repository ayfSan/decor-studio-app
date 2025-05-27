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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

    <!-- Фильтры и Поиск -->
    <div class="mb-6 p-4 bg-white shadow rounded-lg">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label for="filterCategory" class="label-form">Категория</label>
          <select
            id="filterCategory"
            v-model="filterCategory"
            class="input-field"
          >
            <option value="">Все категории</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div>
          <label for="filterType" class="label-form">Тип операции</label>
          <select id="filterType" v-model="filterType" class="input-field">
            <option value="">Все типы</option>
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
            <option value="">Все мероприятия</option>
            <option
              v-for="event_item in demoEvents"
              :key="event_item.id"
              :value="event_item.id"
            >
              {{ event_item.name }}
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
            <option value="">Все счета</option>
            <option
              v-for="account_item in demoAccounts"
              :key="account_item.id"
              :value="account_item.id"
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
        <button
          @click="resetFilters"
          class="btn-secondary h-10 md:mt-5 lg:col-start-auto"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>

    <!-- Аналитика по категориям -->
    <div class_="mb-8">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        Аналитика по категориям
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-medium text-gray-700 mb-3">
            Расходы по категориям
          </h3>
          <div v-if="expenseByCategory.length === 0" class="text-gray-500">
            Нет данных о расходах.
          </div>
          <div
            v-for="item in expenseByCategory"
            :key="item.category"
            class="mb-3"
          >
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-600">{{ item.category }}</span>
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
          <div v-if="incomeByCategory.length === 0" class="text-gray-500">
            Нет данных о доходах.
          </div>
          <div
            v-for="item in incomeByCategory"
            :key="item.category"
            class="mb-3"
          >
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-600">{{ item.category }}</span>
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
      <table class="min-w-full leading-normal">
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
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ formatDate(transaction.date) }}</td>
            <td class="td-cell">
              <span
                :class="
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ transaction.type === "income" ? "Доход" : "Расход" }}
              </span>
            </td>
            <td class="td-cell">{{ transaction.category }}</td>
            <td class="td-cell">{{ transaction.description }}</td>
            <td
              class="td-cell text-right font-medium"
              :class="
                transaction.type === 'income'
                  ? 'text-green-700'
                  : 'text-red-700'
              "
            >
              {{ transaction.type === "income" ? "+" : "-"
              }}{{ formatCurrency(transaction.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
// import { useRouter } from "vue-router"; // Пока не используется, но может понадобиться

// const router = useRouter(); // Пока не используется

// Демонстрационные данные для фильтров
const demoEvents = ref([
  { id: 1, name: "Свадьба Ивановых" },
  { id: 2, name: "Юбилей компании XYZ" },
  { id: 3, name: "Конференция разработчиков" },
]);

const demoAccounts = ref([
  { id: 101, name: "Основной расчетный счет" },
  { id: 102, name: "Касса организации" },
  { id: 103, name: "Счет для проектных расходов" },
]);

// Демонстрационные данные категорий (можно будет получать из Cashflow.vue или другого источника)
const allCategories = ref([
  "Аванс от клиента",
  "Продажа услуг",
  "Возврат от поставщика",
  "Декор и флористика",
  "Кейтеринг и банкет",
  "Аренда площадки",
  "Транспортные расходы",
  "Оплата персоналу",
  "Техническое оборудование",
  "Реклама и маркетинг",
  "Расходные материалы",
  "Прочие доходы",
  "Прочие расходы",
]);

// Демонстрационные транзакции (можно будет получать из Cashflow.vue или общего хранилища)
const transactions = ref([
  {
    id: 1,
    date: "2024-05-01",
    type: "income",
    category: "Аванс от клиента",
    description: "Предоплата за свадьбу Ивановых",
    amount: 150000,
  },
  {
    id: 2,
    date: "2024-05-02",
    type: "expense",
    category: "Кейтеринг и банкет",
    description: "Закупка продуктов для банкета",
    amount: 45000,
  },
  {
    id: 3,
    date: "2024-05-03",
    type: "expense",
    category: "Декор и флористика",
    description: "Цветы и украшения для зала",
    amount: 35000,
  },
  {
    id: 4,
    date: "2024-05-05",
    type: "income",
    category: "Продажа услуг",
    description: "Окончательный расчет по свадьбе Ивановых",
    amount: 200000,
  },
  {
    id: 5,
    date: "2024-05-06",
    type: "expense",
    category: "Аренда площадки",
    description: "Аренда ресторана 'Панорама'",
    amount: 70000,
  },
  {
    id: 6,
    date: "2024-05-07",
    type: "expense",
    category: "Оплата персоналу",
    description: "Гонорар ведущему и DJ",
    amount: 60000,
  },
  {
    id: 7,
    date: "2024-05-10",
    type: "income",
    category: "Аванс от клиента",
    description: "Аванс за юбилей компании XYZ",
    amount: 100000,
  },
  {
    id: 8,
    date: "2024-05-12",
    type: "expense",
    category: "Реклама и маркетинг",
    description: "Оплата таргетированной рекламы",
    amount: 15000,
  },
  {
    id: 9,
    date: "2024-05-15",
    type: "expense",
    category: "Транспортные расходы",
    description: "Доставка оборудования на мероприятие",
    amount: 5000,
  },
  {
    id: 10,
    date: "2024-05-18",
    type: "income",
    category: "Продажа услуг",
    description: "Дополнительные услуги на юбилее XYZ",
    amount: 25000,
    eventId: 2,
    accountId: 101,
  },
]);

const filterCategory = ref("");
const filterType = ref("");
const searchQuery = ref("");
const filterEvent = ref("");
const filterAccount = ref("");
const filterStartDate = ref("");
const filterEndDate = ref("");

const uniqueCategories = computed(() => {
  const categories = new Set(transactions.value.map((t) => t.category));
  return Array.from(categories).sort();
});

const filteredTransactions = computed(() => {
  return transactions.value
    .filter((t) => {
      const transactionDate = new Date(t.date);
      const startDate = filterStartDate.value
        ? new Date(filterStartDate.value)
        : null;
      const endDate = filterEndDate.value
        ? new Date(filterEndDate.value)
        : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const matchesCategory = filterCategory.value
        ? t.category === filterCategory.value
        : true;
      const matchesType = filterType.value ? t.type === filterType.value : true;
      const matchesSearch = searchQuery.value
        ? t.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        : true;
      const matchesEvent = filterEvent.value
        ? t.eventId === filterEvent.value
        : true;
      const matchesAccount = filterAccount.value
        ? t.accountId === filterAccount.value
        : true;
      const matchesStartDate = startDate ? transactionDate >= startDate : true;
      const matchesEndDate = endDate ? transactionDate <= endDate : true;

      return (
        matchesCategory &&
        matchesType &&
        matchesSearch &&
        matchesEvent &&
        matchesAccount &&
        matchesStartDate &&
        matchesEndDate
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalIncome = computed(() => {
  return filteredTransactions.value
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalExpense = computed(() => {
  return filteredTransactions.value
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
});

const balance = computed(() => totalIncome.value - totalExpense.value);

const calculateCategoryTotals = (type) => {
  const relevantTransactions = filteredTransactions.value.filter(
    (t) => t.type === type
  );
  const totalForType = relevantTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const totals = relevantTransactions.reduce((acc, transaction) => {
    acc[transaction.category] =
      (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalForType > 0 ? (total / totalForType) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

const expenseByCategory = computed(() => calculateCategoryTotals("expense"));
const incomeByCategory = computed(() => calculateCategoryTotals("income"));

function formatCurrency(value) {
  const val = parseFloat(value);
  if (isNaN(val)) return "0 ₽";
  return val.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}

function resetFilters() {
  filterCategory.value = "";
  filterType.value = "";
  searchQuery.value = "";
  filterEvent.value = "";
  filterAccount.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
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
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm border border-gray-300;
}
</style>
