<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Мероприятия</h1>
      <button
        @click="openAddEventModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Новое мероприятие</span>
      </button>
    </div>

    <!-- Поиск и фильтры -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по названию мероприятия..."
        class="input-field w-full md:w-1/2 lg:w-1/3"
      />
    </div>

    <div v-if="!hasEventsAfterFilter" class="text-center py-10 text-gray-500">
      <p v-if="events.length === 0">Нет мероприятий для отображения.</p>
      <p v-else>Мероприятия по вашему запросу не найдены.</p>
      <p v-if="events.length === 0">
        Нажмите "Новое мероприятие", чтобы добавить.
      </p>
    </div>

    <div v-else>
      <div
        v-for="(yearGroup, year) in filteredAndGroupedEvents"
        :key="year"
        class="mb-8"
      >
        <h2
          @click="toggleGroup('year-' + year)"
          class="text-2xl font-semibold text-gray-700 mb-4 sticky top-0 bg-white py-2 z-10 border-b cursor-pointer flex justify-between items-center select-none"
        >
          {{ year }} год
          <span
            class="material-symbols-outlined text-gray-500 transform transition-transform duration-200"
            :class="{ 'rotate-180': isGroupExpanded('year-' + year) }"
          >
            expand_more
          </span>
        </h2>
        <div v-if="isGroupExpanded('year-' + year)">
          <div
            v-for="(monthGroup, monthName) in yearGroup"
            :key="monthName"
            class="mb-6 ml-4 md:ml-6"
          >
            <h3
              @click="toggleGroup('month-' + year + '-' + monthName)"
              class="text-xl font-medium text-gray-600 mb-3 cursor-pointer flex justify-between items-center select-none"
            >
              {{ monthName }}
              <span
                class="material-symbols-outlined text-gray-500 transform transition-transform duration-200"
                :class="{
                  'rotate-180': isGroupExpanded(
                    'month-' + year + '-' + monthName
                  ),
                }"
              >
                expand_more
              </span>
            </h3>
            <div
              v-if="isGroupExpanded('month-' + year + '-' + monthName)"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div
                v-for="event_item in monthGroup"
                :key="event_item.idevent"
                class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                <div class="bg-primary-50 p-4">
                  <h3
                    class="font-semibold text-lg text-primary-700 truncate"
                    :title="event_item.project_name"
                  >
                    {{ event_item.project_name || "Мероприятие без названия" }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ formatDateShort(event_item.date) }}
                  </p>
                </div>

                <div class="p-4 space-y-2 flex-grow">
                  <p class="text-sm">
                    <strong class="font-medium">Стоимость:</strong>
                    {{ formatCurrency(event_item.cost) }}
                  </p>
                </div>

                <div class="p-4 border-t border-gray-200 bg-gray-50">
                  <router-link
                    :to="{
                      name: 'EventDetail',
                      params: { eventId: event_item.idevent },
                    }"
                    class="btn-primary-outline w-full flex items-center justify-center text-sm"
                  >
                    <span class="material-symbols-outlined text-base mr-1"
                      >visibility</span
                    >
                    Подробнее
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit Event -->
    <div
      v-if="isEventModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditMode ? "Редактировать мероприятие" : "Новое мероприятие" }}
        </h2>
        <form
          @submit.prevent="saveEvent"
          class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
        >
          <div>
            <label for="project_name" class="label-form"
              >Название проекта/мероприятия</label
            >
            <input
              type="text"
              id="project_name"
              v-model="currentEvent.project_name"
              class="input-field"
            />
          </div>
          <div>
            <label for="date" class="label-form">Дата и время</label>
            <input
              type="datetime-local"
              id="date"
              v-model="currentEvent.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="category_event_idcategory_event" class="label-form"
              >Категория</label
            >
            <select
              id="category_event_idcategory_event"
              v-model.number="currentEvent.category_event_idcategory_event"
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите категорию</option>
              <option
                v-for="category in eventCategories"
                :key="category.idcategory_event"
                :value="category.idcategory_event"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="venue_idvenue" class="label-form">Место</label>
            <select
              id="venue_idvenue"
              v-model.number="currentEvent.venue_idvenue"
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите место</option>
              <option
                v-for="venue in venuesList"
                :key="venue.idvenue"
                :value="venue.idvenue"
              >
                {{ venue.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="customer_idcustomer" class="label-form">Клиент</label>
            <select
              id="customer_idcustomer"
              v-model.number="currentEvent.customer_idcustomer"
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите клиента</option>
              <option
                v-for="customer in customersList"
                :key="customer.idcustomer"
                :value="customer.idcustomer"
              >
                {{ customer.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="cost" class="label-form">Стоимость</label>
            <input
              type="number"
              step="0.01"
              id="cost"
              v-model.number="currentEvent.cost"
              class="input-field"
            />
          </div>
          <div class="sm:col-span-2">
            <label for="participants" class="label-form"
              >Участники (описание)</label
            >
            <textarea
              id="participants"
              v-model="currentEvent.participants"
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <div class="sm:col-span-2 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeEventModal"
              class="btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditMode ? "Сохранить изменения" : "Создать мероприятие" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const searchQuery = ref(""); // Для текстового поиска

// Demo data for related entities
const eventCategories = ref([
  { idcategory_event: 1, name: "Свадьба" },
  { idcategory_event: 2, name: "Корпоратив" },
  { idcategory_event: 3, name: "День рождения" },
  { idcategory_event: 4, name: "Конференция" },
]);

const venuesList = ref([
  { idvenue: 1, name: 'Ресторан "Золотой Дракон"' },
  { idvenue: 2, name: 'Лофт "Атмосфера"' },
  { idvenue: 3, name: 'Конференц-зал "Орион"' },
]);

const customersList = ref([
  { idcustomer: 1, name: 'ООО "Праздник Плюс"' },
  { idcustomer: 2, name: "Анна Петрова" },
  { idcustomer: 3, name: "Иван Сидоров" },
]);

// Demo data - in real app, fetch from API
const events = ref([
  {
    idevent: 1,
    date: "2024-07-15T14:00:00.000Z",
    project_name: "Свадьба Анны и Петра",
    category_event_idcategory_event: 1,
    venue_idvenue: 1,
    customer_idcustomer: 2,
    cost: 250000,
    participants: "Молодожены, гости (50 чел)",
  },
  {
    idevent: 2,
    date: "2024-08-20T18:00:00.000Z",
    project_name: 'Юбилей компании "ТехноПрорыв"',
    category_event_idcategory_event: 2,
    venue_idvenue: 2,
    customer_idcustomer: 1,
    cost: 500000,
    participants: "Сотрудники компании (100 чел), руководство",
  },
  {
    idevent: 3,
    date: "2023-12-10T12:00:00.000Z",
    project_name: "Новогодний корпоратив",
    category_event_idcategory_event: 2,
    venue_idvenue: 1,
    customer_idcustomer: 1,
    cost: 300000,
    participants: "Сотрудники (70 чел)",
  },
  {
    idevent: 4,
    date: "2024-07-25T10:00:00.000Z",
    project_name: "Конференция Разработчиков",
    category_event_idcategory_event: 4,
    venue_idvenue: 3,
    customer_idcustomer: 3,
    cost: 150000,
    participants: "Участники конференции (120 чел), спикеры",
  },
  {
    idevent: 5,
    date: "2024-09-05T16:00:00.000Z",
    project_name: "День Рождения Ивана",
    category_event_idcategory_event: 3,
    venue_idvenue: 2,
    customer_idcustomer: 3,
    cost: 80000,
    participants: "Именинник, друзья (20 чел)",
  },
  {
    idevent: 6,
    project_name: "Стратегическая сессия",
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    cost: 120000,
    category_event_idcategory_event: 2,
    venue_idvenue: 1,
    customer_idcustomer: 3,
    participants: "Топ менеджмент",
  },
]);

const isEventModalOpen = ref(false);
const currentEvent = ref({});
const isEditMode = ref(false);

const defaultEvent = {
  date: new Date().toISOString().slice(0, 16),
  project_name: "",
  category_event_idcategory_event: null,
  venue_idvenue: null,
  customer_idcustomer: null,
  cost: 0.0,
  participants: "",
};

const expandedGroups = ref({});

const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};

const isGroupExpanded = (groupId) => {
  if (expandedGroups.value[groupId] === undefined) {
    if (groupId.startsWith("year-")) {
      const yearFromGroupId = groupId.split("-")[1];
      const currentYear = new Date().getFullYear().toString();
      return yearFromGroupId === currentYear;
    }
    if (groupId.startsWith("month-")) {
      const [, yearFromGroupId, monthNameFromGroupId] = groupId.split("-");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear().toString();
      const currentMonthName =
        currentDate
          .toLocaleString("ru-RU", { month: "long" })
          .charAt(0)
          .toUpperCase() +
        currentDate.toLocaleString("ru-RU", { month: "long" }).slice(1);
      return (
        yearFromGroupId === currentYear &&
        monthNameFromGroupId === currentMonthName
      );
    }
    return false;
  }
  return expandedGroups.value[groupId];
};

// Вычисляемое свойство для фильтрации событий перед группировкой
const filteredEvents = computed(() => {
  if (!searchQuery.value) {
    return events.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return events.value.filter((event) =>
    (event.project_name || "").toLowerCase().includes(lowerSearchQuery)
  );
});

const hasEventsAfterFilter = computed(() => {
  return filteredEvents.value.length > 0;
});

function formatDateShort(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}

function formatCurrency(value) {
  const val = parseFloat(value);
  if (isNaN(val)) return "-";
  return val.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  });
}

function openAddEventModal() {
  isEditMode.value = false;
  currentEvent.value = {
    ...defaultEvent,
    date: new Date().toISOString().slice(0, 16),
  };
  isEventModalOpen.value = true;
}

function openEditEventModal(event_item) {
  isEditMode.value = true;
  const dateForInput = event_item.date
    ? new Date(event_item.date).toISOString().slice(0, 16)
    : "";
  currentEvent.value = { ...event_item, date: dateForInput };
  isEventModalOpen.value = true;
}

function closeEventModal() {
  isEventModalOpen.value = false;
}

function saveEvent() {
  if (currentEvent.value.date) {
    const localDate = new Date(currentEvent.value.date);
    currentEvent.value.date = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  }
  if (isEditMode.value) {
    const index = events.value.findIndex(
      (e) => e.idevent === currentEvent.value.idevent
    );
    if (index !== -1) {
      events.value[index] = { ...currentEvent.value };
    }
  } else {
    currentEvent.value.idevent = Date.now() + Math.floor(Math.random() * 1000);
    events.value.push({ ...currentEvent.value });
  }
  closeEventModal();
}

function confirmDeleteEvent(event_item) {
  if (
    confirm(
      `Вы уверены, что хотите удалить мероприятие "${event_item.project_name}"?`
    )
  ) {
    deleteEvent(event_item);
  }
}

function deleteEvent(eventToDelete) {
  events.value = events.value.filter(
    (e) => e.idevent !== eventToDelete.idevent
  );
}

const goToTodoList = (eventId) => {
  router.push(`/todo/${eventId}`);
};

const groupedEvents = computed(() => {
  const groups = {};
  const sortedEvents = [...filteredEvents.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  for (const event of sortedEvents) {
    const date = new Date(event.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("ru-RU", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    if (!groups[year]) {
      groups[year] = {};
    }
    if (!groups[year][capitalizedMonth]) {
      groups[year][capitalizedMonth] = [];
    }
    groups[year][capitalizedMonth].push(event);
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthName =
    currentDate
      .toLocaleString("ru-RU", { month: "long" })
      .charAt(0)
      .toUpperCase() +
    currentDate.toLocaleString("ru-RU", { month: "long" }).slice(1);
  if (groups[currentYear] && groups[currentYear][currentMonthName]) {
    expandedGroups.value["year-" + currentYear] = true;
    expandedGroups.value[
      "month-" + currentYear + "-" + currentMonthName
    ] = true;
  } else if (groups[currentYear]) {
    expandedGroups.value["year-" + currentYear] = true;
  }

  return groups;
});

// Переименовываем computed property для ясности
const filteredAndGroupedEvents = groupedEvents;

onMounted(() => {
  const forceCompute = filteredAndGroupedEvents.value;
});
</script>

<style scoped>
/* Общие стили для кнопок и полей ввода, можно вынести в глобальные стили или общий CSS файл, если будут часто повторяться */
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-md transition-colors duration-200;
}
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-md transition-colors duration-200;
}
.btn-primary-outline {
  @apply px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg shadow-sm transition-colors duration-200;
}
</style>
