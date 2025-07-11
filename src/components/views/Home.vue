<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/api.service.js";
import { formatCurrency, formatDate } from "@/utils/formatters.js";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const router = useRouter();

// --- Reactive Data ---
const stats = ref({
  activeEvents: 0,
  teamMembers: 0,
  completedThisMonth: 0,
});
const upcomingEvents = ref([]);
const calendarEvents = ref([]); // Для событий календаря
const isLoading = ref(true);
const loadingError = ref(null);

// --- Transaction Modal State ---
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

// --- Data for Modal Selects ---
const accountsForModal = ref([]);
const categoriesForModal = ref([]);
const eventsListForModal = ref([]);

// --- Calendar Options ---
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,dayGridWeek",
  },
  events: calendarEvents.value,
  locale: "ru",
  buttonText: {
    today: "Сегодня",
    month: "Месяц",
    week: "Неделя",
  },
  eventClick: (info) => {
    router.push({
      name: "EventDetail",
      params: { eventId: info.event.id },
    });
  },
  height: "auto",
}));

// --- Data Loading ---
async function loadDashboardData() {
  isLoading.value = true;
  loadingError.value = null;
  try {
    const [statsRes, upcomingEventsRes, myEventsRes] = await Promise.all([
      apiService.getStatistics(),
      apiService.getUpcomingEvents(),
      apiService.getMyEvents(), // Загружаем события для календаря
    ]);

    stats.value = statsRes.data.data;
    upcomingEvents.value = upcomingEventsRes.data.data;

    // Форматируем события для FullCalendar
    if (myEventsRes.data.success) {
      calendarEvents.value = myEventsRes.data.data.map((event) => ({
        id: event.idevent,
        title: event.project_name,
        start: event.date,
        allDay: false, // Можно сделать на весь день, если время не важно
      }));
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    loadingError.value =
      "Не удалось загрузить данные для панели управления. Пожалуйста, попробуйте еще раз.";
    // Перехватчик axios обработает 401/403 ошибки и выполнит выход.
  } finally {
    isLoading.value = false;
  }
}

// Function to load data for the modal on-demand
async function loadModalData() {
  try {
    const [accountsRes, categoriesRes, allEventsRes] = await Promise.all([
      apiService.getCashflowAccounts(),
      apiService.getCashflowCategories(),
      apiService.getEvents(),
    ]);
    accountsForModal.value = accountsRes.data.data;
    categoriesForModal.value = categoriesRes.data.data;
    eventsListForModal.value = allEventsRes.data.data;
  } catch (error) {
    console.error("Failed to load modal data:", error);
    // Optionally show an error to the user inside the modal
  }
}

onMounted(loadDashboardData);

// --- Modal Logic ---
function openAddTransactionModal() {
  currentTransaction.value = { ...defaultTransaction };
  isTransactionModalOpen.value = true;
  // Load data when modal is opened
  loadModalData();
}

function closeTransactionModal() {
  isTransactionModalOpen.value = false;
}

async function saveTransaction() {
  try {
    const response = await apiService.createCashflow(currentTransaction.value);
    if (response.data.success) {
      // Maybe show a success notification
      console.log("Transaction saved successfully:", response.data.data);
      closeTransactionModal();
      // Optional: you might want to refresh some data here
    } else {
      console.error("Failed to save transaction:", response.data.message);
      alert(`Ошибка: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error saving transaction:", error);
    alert("Произошла ошибка при сохранении транзакции.");
  }
}

// --- Navigation ---
function navigateToNewEvent() {
  router.push("/events");
}

function navigateToNewMember() {
  router.push("/members");
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Панель управления</h1>

    <div v-if="isLoading" class="text-center text-gray-500 py-10">
      Загрузка данных...
    </div>

    <div
      v-else-if="loadingError"
      class="text-center text-red-500 bg-red-50 p-6 rounded-lg shadow-sm"
    >
      <p class="font-semibold text-lg mb-2">Ошибка при загрузке</p>
      <p>{{ loadingError }}</p>
      <button @click="loadDashboardData" class="mt-4 btn-primary">
        Попробовать снова
      </button>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Статистика -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-medium mb-4">Общая статистика</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Активные мероприятия</span>
              <span class="font-medium text-lg text-primary-600">{{
                stats.activeEvents
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Участники команды</span>
              <span class="font-medium text-lg text-primary-600">{{
                stats.teamMembers
              }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Завершено в этом месяце</span>
              <span class="font-medium text-lg text-primary-600">{{
                stats.completedThisMonth
              }}</span>
            </div>
          </div>
        </div>

        <!-- Ближайшие мероприятия -->
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-medium mb-4">Ближайшие мероприятия</h2>
          <div v-if="upcomingEvents.length > 0" class="space-y-4">
            <div
              v-for="event in upcomingEvents"
              :key="event.idevent"
              class="border-b pb-3 last:border-b-0"
            >
              <router-link
                :to="{
                  name: 'EventDetail',
                  params: { eventId: event.idevent },
                }"
                class="font-medium hover:text-primary-600 hover:underline"
              >
                {{ event.project_name || "Мероприятие без названия" }}
              </router-link>
              <div class="text-sm text-gray-600 mt-1">
                {{ formatDate(event.date) }}
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 mt-4">
            Нет предстоящих мероприятий.
          </p>
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
              @click="openAddTransactionModal"
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

      <!-- Календарь -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Мой календарь мероприятий</h2>
        <FullCalendar :options="calendarOptions" />
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

:deep(.fc-event) {
  cursor: pointer;
  border: 1px solid theme("colors.primary.600");
  background-color: theme("colors.primary.100");
  color: theme("colors.primary.700");
}
:deep(.fc-event:hover) {
  background-color: theme("colors.primary.100");
  opacity: 0.8;
}
:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
}
</style>
