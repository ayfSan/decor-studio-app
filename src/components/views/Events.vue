<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Мероприятия</h1>
      <button @click="openAddEventModal" class="btn-primary flex items-center">
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
      <p v-if="events.length === 0 && !isLoading">
        Нет мероприятий для отображения.
      </p>
      <p v-if="isLoading">Загрузка мероприятий...</p>
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
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Новое мероприятие</h2>
        <form
          @submit.prevent="saveEvent"
          class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
        >
          <!-- Event Details -->
          <div>
            <label for="project_name" class="label-form">Название</label>
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
            <label for="category_event" class="label-form">Категория</label>
            <select
              id="category_event"
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
            <label for="venue" class="label-form">Место</label>
            <select
              id="venue"
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
            <label for="customer" class="label-form">Клиент</label>
            <select
              id="customer"
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

          <!-- Participants Section -->
          <div class="sm:col-span-2">
            <label class="label-form">Команда мероприятия</label>
            <div
              v-if="
                currentEvent.participants &&
                currentEvent.participants.length > 0
              "
              class="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50"
            >
              <div
                v-for="member in currentEvent.participants"
                :key="member.uniqueId"
                class="flex items-center justify-between p-2 bg-white rounded-sm shadow-xs"
              >
                <span class="text-sm">{{ member.name }}</span>
                <button
                  type="button"
                  @click="removeParticipantFromForm(member.uniqueId)"
                  class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                >
                  <span
                    class="material-symbols-outlined text-lg leading-none align-middle"
                    >close</span
                  >
                </button>
              </div>
            </div>
            <p v-else class="mt-2 text-sm text-gray-500 italic">
              Участники еще не добавлены.
            </p>
            <button
              type="button"
              @click="openAddParticipantModal"
              class="mt-3 btn-form-secondary text-sm py-1.5 px-3 flex items-center"
            >
              <span class="material-symbols-outlined text-base mr-1">add</span>
              Добавить участника
            </button>
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
              Создать мероприятие
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Adding Participant to Event -->
    <div
      v-if="isAddParticipantModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Добавить участника</h3>
        <input
          type="text"
          v-model="participantSearchQuery"
          placeholder="Поиск по имени..."
          class="input-field w-full mb-4"
        />
        <div class="max-h-60 overflow-y-auto border rounded-md">
          <ul v-if="filteredTeamMembers.length > 0">
            <li
              v-for="member in filteredTeamMembers"
              :key="member.uniqueId"
              @click="addParticipantToForm(member)"
              class="px-3 py-2 hover:bg-primary-50 cursor-pointer border-b last:border-b-0"
            >
              <p>
                {{ member.name }}
                <span class="text-gray-500 text-sm">({{ member.type }})</span>
              </p>
            </li>
          </ul>
          <p v-else class="p-3 text-sm text-gray-500 text-center">
            Участники не найдены.
          </p>
        </div>
        <div class="mt-6 flex justify-end">
          <button @click="closeAddParticipantModal" class="btn-form-secondary">
            Закрыть
          </button>
        </div>
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
import NProgress from "nprogress";

const router = useRouter();

// Data stores
const events = ref([]);
const eventCategories = ref([]);
const venuesList = ref([]);
const customersList = ref([]);
const allTeamMembers = ref([]);
const searchQuery = ref("");
const isLoading = ref(true);

// Event Modal state
const isEventModalOpen = ref(false);
const isEditMode = ref(false);
const currentEvent = ref(null);

// Participant Modal state
const isAddParticipantModalOpen = ref(false);
const participantSearchQuery = ref("");

// Accordion state
const expandedGroups = ref({});

// --- DATA LOADING ---
const loadAllSupportingData = async () => {
  try {
    const [categoriesRes, venuesRes, customersRes, teamMembersRes] =
      await Promise.all([
        apiService.getEventCategories(),
        apiService.getVenues(),
        apiService.getCustomers(),
        apiService.getTeamMembers(),
      ]);
    eventCategories.value = categoriesRes.success ? categoriesRes.data : [];
    venuesList.value = venuesRes.success ? venuesRes.data : [];
    customersList.value = customersRes.success ? customersRes.data : [];
    allTeamMembers.value = teamMembersRes.success ? teamMembersRes.data : [];
  } catch (error) {
    console.error("Error loading supporting data:", error);
  }
};

async function loadEvents() {
  isLoading.value = true;
  NProgress.start();
  try {
    const response = await apiService.getEvents();
    events.value = response.success ? response.data : [];
  } catch (error) {
    console.error("Error loading events:", error);
  } finally {
    isLoading.value = false;
    NProgress.done();
  }
}

onMounted(() => {
  loadEvents();
  loadAllSupportingData();
});

// --- DISPLAY LOGIC ---
const filteredEvents = computed(() => {
  if (!searchQuery.value) return events.value;
  return events.value.filter((event) =>
    event.project_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredAndGroupedEvents = computed(() => {
  const sorted = [...filteredEvents.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const grouped = {};
  sorted.forEach((event) => {
    const date = new Date(event.date);
    const year = date.getFullYear();
    const monthName = date.toLocaleString("ru-RU", { month: "long" });
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][monthName]) grouped[year][monthName] = [];
    grouped[year][monthName].push(event);
  });
  return grouped;
});

const hasEventsAfterFilter = computed(() => filteredEvents.value.length > 0);

const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};

const isGroupExpanded = (groupId) => expandedGroups.value[groupId] !== false;

// --- EVENT MODAL LOGIC ---
const openAddEventModal = () => {
  currentEvent.value = {
    date: new Date().toISOString().slice(0, 16),
    project_name: "",
    category_event_idcategory_event: null,
    venue_idvenue: null,
    customer_idcustomer: null,
    cost: 0.0,
    participants: [], // Initialize as an empty array
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
  NProgress.start();
  try {
    // We are only creating events here, not editing
    const response = await apiService.createEvent(currentEvent.value);
    if (response.success) {
      await loadEvents();
      closeEventModal();
    } else {
      console.error("Failed to create event:", response.message);
      alert("Не удалось создать мероприятие.");
    }
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Произошла ошибка при создании мероприятия.");
  } finally {
    NProgress.done();
  }
};

// --- PARTICIPANT MODAL LOGIC ---
const filteredTeamMembers = computed(() => {
  if (!isAddParticipantModalOpen.value || !currentEvent.value) return [];
  const addedIds = new Set(
    currentEvent.value.participants.map((p) => p.uniqueId)
  );
  let available = allTeamMembers.value.filter(
    (member) => !addedIds.has(member.uniqueId)
  );
  if (participantSearchQuery.value) {
    const query = participantSearchQuery.value.toLowerCase();
    available = available.filter((member) =>
      member.name.toLowerCase().includes(query)
    );
  }
  return available;
});

const openAddParticipantModal = () => {
  participantSearchQuery.value = "";
  isAddParticipantModalOpen.value = true;
};

const closeAddParticipantModal = () =>
  (isAddParticipantModalOpen.value = false);

const addParticipantToForm = (member) => {
  currentEvent.value.participants.push(member);
  closeAddParticipantModal();
};

const removeParticipantFromForm = (uniqueId) => {
  currentEvent.value.participants = currentEvent.value.participants.filter(
    (p) => p.uniqueId !== uniqueId
  );
};
</script>

<style scoped>
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
.btn-form-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200;
}
</style>
