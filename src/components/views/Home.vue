<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/api.service.js";

const router = useRouter();

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Данные и логика для модального окна добавления транзакции
const isTransactionModalOpen = ref(false);
const currentTransaction = ref({});
const defaultTransaction = {
  date: new Date().toISOString().slice(0, 16),
  transaction: "",
  account_cashflow_idaccount_cashflow: null,
  category_cashflow_idcategory_cashflow: null,
  event_idevent: null,
  note: "",
  income: 0,
  expense: 0,
};

// Мок-данные для селектов в модальном окне
const accountsForModal = ref([
  { idaccount_cashflow: 1, name: "Основной счет" },
  { idaccount_cashflow: 2, name: "Резервный фонд" },
  { idaccount_cashflow: 3, name: "Касса" },
]);

const categoriesForModal = ref([
  { idcategory_cashflow: 1, name: "Аренда помещения" },
  { idcategory_cashflow: 2, name: "Зарплата" },
  { idcategory_cashflow: 3, name: "Закупка материалов" },
  { idcategory_cashflow: 4, name: "Доход от мероприятия" },
]);

const eventsListForModal = ref([
  { idevent: 1, project_name: "Свадьба Анны и Петра" },
  { idevent: 2, project_name: 'Юбилей компании "ТехноПрорыв"' },
  { idevent: 4, project_name: "Конференция Разработчиков" },
]);

function openAddTransactionModal() {
  currentTransaction.value = {
    ...defaultTransaction,
    date: new Date().toISOString().slice(0, 16),
  };
  isTransactionModalOpen.value = true;
}

function closeTransactionModal() {
  isTransactionModalOpen.value = false;
}

function saveTransaction() {
  if (currentTransaction.value.date) {
    const localDate = new Date(currentTransaction.value.date);
    currentTransaction.value.date = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  }
  console.log("Новая транзакция (сохранено из Home.vue - mock):", {
    ...currentTransaction.value,
    idcashflow: Date.now(),
  });
  closeTransactionModal();
}

const daysInMonth = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value + 1, 0);
  return Array.from({ length: date.getDate() }, (_, i) => i + 1);
});

const blanks = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  // Сдвиг: JS начинается с воскресенья, мы — с понедельника
  return firstDay === 0 ? 6 : firstDay - 1;
});

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
}

const upcomingEvents = ref([
  { id: 1, name: "Свадьба Анны и Петра", date: "15 мая 2024" },
  { id: 2, name: "Юбилей компании", date: "20 мая 2024" },
  { id: 3, name: "Выпускной вечер", date: "25 мая 2024" },
]);

function navigateToNewEvent() {
  router.push("/events");
}

function navigateToNewTransaction() {
  openAddTransactionModal(); // Открываем модальное окно
}

function navigateToNewMember() {
  router.push("/members");
}

onMounted(async () => {
  try {
    const data = await apiService.testApi();
    console.log("API Test successful:", data);
  } catch (error) {
    console.error("API Test failed:", error);
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Панель управления</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Статистика -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">Общая статистика</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Активные мероприятия</span>
            <span class="font-medium">3</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Участники команды</span>
            <span class="font-medium">8</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Завершено в этом месяце</span>
            <span class="font-medium">5</span>
          </div>
        </div>
      </div>

      <!-- Ближайшие мероприятия -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">Ближайшие мероприятия</h2>
        <div class="space-y-4">
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="border-b pb-3 last:border-b-0"
          >
            <div class="font-medium">{{ event.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ event.date }}</div>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">Быстрые действия</h2>
        <div class="space-y-3">
          <button
            @click="navigateToNewEvent"
            class="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left flex items-center"
          >
            <span class="material-symbols-outlined mr-2">add_circle</span>
            Новое мероприятие
          </button>
          <button
            @click="navigateToNewTransaction"
            class="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left flex items-center"
          >
            <span class="material-symbols-outlined mr-2">payments</span>
            Добавить транзакцию
          </button>
          <button
            @click="navigateToNewMember"
            class="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left flex items-center"
          >
            <span class="material-symbols-outlined mr-2">person_add</span>
            Добавить участника
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Add Transaction -->
    <div
      v-if="isTransactionModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Добавить операцию</h2>
        <form
          @submit.prevent="saveTransaction"
          class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
        >
          <div>
            <label for="home_trans_date" class="label-form">Дата</label>
            <input
              type="datetime-local"
              id="home_trans_date"
              v-model="currentTransaction.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="home_trans_transaction" class="label-form"
              >Описание операции</label
            >
            <input
              type="text"
              id="home_trans_transaction"
              v-model="currentTransaction.transaction"
              placeholder="Например, Оплата аренды"
              class="input-field"
            />
          </div>
          <div>
            <label for="home_trans_account" class="label-form">Счет</label>
            <select
              id="home_trans_account"
              v-model.number="
                currentTransaction.account_cashflow_idaccount_cashflow
              "
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите счет</option>
              <option
                v-for="acc in accountsForModal"
                :key="acc.idaccount_cashflow"
                :value="acc.idaccount_cashflow"
              >
                {{ acc.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="home_trans_category" class="label-form"
              >Категория</label
            >
            <select
              id="home_trans_category"
              v-model.number="
                currentTransaction.category_cashflow_idcategory_cashflow
              "
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите категорию</option>
              <option
                v-for="cat in categoriesForModal"
                :key="cat.idcategory_cashflow"
                :value="cat.idcategory_cashflow"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="home_trans_income" class="label-form">Приход</label>
            <input
              type="number"
              step="0.01"
              id="home_trans_income"
              v-model.number="currentTransaction.income"
              class="input-field"
            />
          </div>
          <div>
            <label for="home_trans_expense" class="label-form">Расход</label>
            <input
              type="number"
              step="0.01"
              id="home_trans_expense"
              v-model.number="currentTransaction.expense"
              class="input-field"
            />
          </div>

          <div class="md:col-span-2">
            <label for="home_trans_event" class="label-form"
              >Событие (опционально)</label
            >
            <select
              id="home_trans_event"
              v-model.number="currentTransaction.event_idevent"
              class="input-field"
            >
              <option :value="null">Без привязки к событию</option>
              <option
                v-for="ev in eventsListForModal"
                :key="ev.idevent"
                :value="ev.idevent"
              >
                {{ ev.project_name }}
              </option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="home_trans_note" class="label-form">Примечание</label>
            <textarea
              id="home_trans_note"
              v-model="currentTransaction.note"
              rows="2"
              class="input-field"
            ></textarea>
          </div>

          <div class="md:col-span-2 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeTransactionModal"
              class="btn-form-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-form-primary">
              Добавить операцию
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-form-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200;
}
.btn-form-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200;
}
</style>
