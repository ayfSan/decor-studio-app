<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 flex items-center"
          title="Назад"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-2xl font-semibold">Учет средств</h1>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Форма добавления транзакции -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">Добавить транзакцию</h2>
          <form @submit.prevent="addTransaction" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Тип транзакции
              </label>
              <select
                v-model="newTransaction.type"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="income">Доход</option>
                <option value="expense">Расход</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Сумма (₽)
              </label>
              <input
                type="number"
                v-model="newTransaction.amount"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <select
                v-model="newTransaction.category"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                v-model="newTransaction.description"
                rows="3"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Добавить
            </button>
          </form>
        </div>
      </div>

      <!-- История транзакций -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium mb-4">История транзакций</h2>

          <!-- Общая статистика -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-green-50 rounded-lg p-4">
              <div class="text-sm text-green-600">Общий доход</div>
              <div class="text-xl font-semibold text-green-700">
                {{ totalIncome }} ₽
              </div>
            </div>
            <div class="bg-red-50 rounded-lg p-4">
              <div class="text-sm text-red-600">Общий расход</div>
              <div class="text-xl font-semibold text-red-700">
                {{ totalExpense }} ₽
              </div>
            </div>
            <div class="bg-primary-50 rounded-lg p-4">
              <div class="text-sm text-primary-600">Баланс</div>
              <div class="text-xl font-semibold text-primary-700">
                {{ balance }} ₽
              </div>
            </div>
          </div>

          <!-- Список транзакций -->
          <div class="space-y-4">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="flex items-center justify-between p-4 rounded-lg"
              :class="
                transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
              "
            >
              <div>
                <div class="font-medium">{{ transaction.description }}</div>
                <div class="text-sm text-gray-600">
                  {{ transaction.category }}
                </div>
                <div class="text-sm text-gray-500">{{ transaction.date }}</div>
              </div>
              <div
                :class="
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                class="font-medium"
              >
                {{ transaction.type === "income" ? "+" : "-"
                }}{{ transaction.amount }} ₽
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const categories = [
  "Декор",
  "Кейтеринг",
  "Аренда помещения",
  "Транспорт",
  "Персонал",
  "Оборудование",
  "Прочее",
];

const transactions = ref([
  {
    id: 1,
    type: "income",
    amount: 150000,
    category: "Декор",
    description: "Предоплата за свадьбу",
    date: "2024-05-01",
  },
  {
    id: 2,
    type: "expense",
    amount: 45000,
    category: "Кейтеринг",
    description: "Закупка продуктов",
    date: "2024-05-02",
  },
  {
    id: 3,
    type: "expense",
    amount: 35000,
    category: "Декор",
    description: "Цветы и украшения",
    date: "2024-05-03",
  },
]);

const newTransaction = ref({
  type: "income",
  amount: 0,
  category: categories[0],
  description: "",
});

const totalIncome = computed(() => {
  return transactions.value
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
});

const totalExpense = computed(() => {
  return transactions.value
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
});

const balance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

const addTransaction = () => {
  transactions.value.unshift({
    id: transactions.value.length + 1,
    ...newTransaction.value,
    date: new Date().toISOString().split("T")[0],
  });

  // Сброс формы
  newTransaction.value = {
    type: "income",
    amount: 0,
    category: categories[0],
    description: "",
  };
};
</script>
