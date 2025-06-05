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
                {{ venue.name_venue }}
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
                {{ customer.name_customer }}
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/api.service.js";
import {
  formatDate,
  formatCurrency,
  formatDateShort,
} from "@/utils/formatters.js";

const router = useRouter();

// Реактивные переменные для данных
const events = ref([]);
const eventCategories = ref([]); // Будут загружены позже
const venuesList = ref([]); // Будут загружены позже
const customersList = ref([]); // Будут загружены позже
const searchQuery = ref("");

// Управление модальным окном
const isEventModalOpen = ref(false);
const isEditMode = ref(false);
const currentEvent = ref(null);

// Управление сворачиваемыми группами
const expandedGroups = ref({});

// --- ЗАГРУЗКА ДАННЫХ ---
async function loadEvents() {
  try {
    const response = await apiService.getEvents();
    if (response.success) {
      events.value = response.data;
    } else {
      console.error("Failed to load events:", response.message);
      // Можно добавить уведомление для пользователя
    }
  } catch (error) {
    console.error("Error loading events:", error);
    // Можно добавить уведомление для пользователя
  }
}

async function loadEventCategories() {
  try {
    const response = await apiService.getEventCategories();
    if (response.success) {
      eventCategories.value = response.data;
    } else {
      console.error("Failed to load event categories:", response.message);
    }
  } catch (error) {
    console.error("Error loading event categories:", error);
  }
}

async function loadVenues() {
  try {
    const response = await apiService.getVenues();
    if (response.success) {
      venuesList.value = response.data;
    } else {
      console.error("Failed to load venues:", response.message);
    }
  } catch (error) {
    console.error("Error loading venues:", error);
  }
}

async function loadCustomers() {
  try {
    const response = await apiService.getCustomers();
    if (response.success) {
      customersList.value = response.data;
    } else {
      console.error("Failed to load customers:", response.message);
    }
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadEvents();
  loadEventCategories();
  loadVenues();
  loadCustomers();
});

// --- ЛОГИКА ОТОБРАЖЕНИЯ ---

const filteredEvents = computed(() => {
  if (!searchQuery.value) {
    return events.value;
  }
  return events.value.filter((event) =>
    event.project_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredAndGroupedEvents = computed(() => {
  const grouped = {};
  filteredEvents.value.forEach((event) => {
    const date = new Date(event.date);
    const year = date.getFullYear();
    const monthName = date.toLocaleString("ru-RU", { month: "long" });

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][monthName]) {
      grouped[year][monthName] = [];
    }
    grouped[year][monthName].push(event);
  });
  return grouped;
});

const hasEventsAfterFilter = computed(() => {
  return filteredEvents.value.length > 0;
});

const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};

const isGroupExpanded = (groupId) => {
  return expandedGroups.value[groupId] !== false; // По умолчанию раскрыты
};

// --- ЛОГИКА МОДАЛЬНОГО ОКНА ---

const openAddEventModal = () => {
  isEditMode.value = false;
  currentEvent.value = {
    date: new Date().toISOString().slice(0, 16),
    project_name: "",
    category_event_idcategory_event: null,
    venue_idvenue: null,
    customer_idcustomer: null,
    cost: 0.0,
    participants: "",
  };
  isEventModalOpen.value = true;
};

const openEditEventModal = (event) => {
  isEditMode.value = true;
  // Мы должны убедиться, что дата в формате, понятном для <input type="datetime-local">
  const dateForInput = event.date
    ? new Date(event.date).toISOString().slice(0, 16)
    : "";
  currentEvent.value = { ...event, date: dateForInput };
  isEventModalOpen.value = true;
};

const closeEventModal = () => {
  isEventModalOpen.value = false;
  currentEvent.value = null;
};

const saveEvent = async () => {
  if (!currentEvent.value) return;

  try {
    if (isEditMode.value) {
      const response = await apiService.updateEvent(
        currentEvent.value.idevent,
        currentEvent.value
      );
      if (response.success) {
        console.log("Event updated successfully!", response.data);
      } else {
        console.error("Failed to update event:", response.message);
        return;
      }
    } else {
      const response = await apiService.createEvent(currentEvent.value);
      if (!response.success) {
        console.error("Failed to create event:", response.message);
        return;
      }
    }
    await loadEvents();
    closeEventModal();
  } catch (error) {
    console.error("Error saving event:", error);
  }
};
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
.btn-secondary-outline {
  @apply px-4 py-2 border border-secondary-600 text-secondary-600 hover:bg-secondary-50 rounded-lg shadow-sm transition-colors duration-200;
}
</style>
