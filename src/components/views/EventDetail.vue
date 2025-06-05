<template>
  <div class="p-4 md:p-6 lg:p-8">
    <div class="mb-6">
      <router-link
        to="/events"
        class="text-primary-600 hover:text-primary-800 hover:underline text-sm inline-flex items-center"
      >
        <span class="material-symbols-outlined mr-1">arrow_back</span>
        Вернуться к списку мероприятий
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Загрузка данных о мероприятии...</p>
    </div>
    <div v-else-if="!event" class="text-center py-10">
      <h1 class="text-2xl font-semibold text-red-600">
        Мероприятие не найдено
      </h1>
      <p class="text-gray-600 mt-2">
        Возможно, оно было удалено или указан неверный ID.
      </p>
      <router-link
        to="/events"
        class="mt-6 inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg"
      >
        К списку мероприятий
      </router-link>
    </div>
    <div
      v-else
      class="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden"
    >
      <div class="bg-primary-600 text-white p-6">
        <h1 class="text-3xl font-bold mb-1">
          {{ event.project_name || "Мероприятие без названия" }}
        </h1>
        <p class="text-lg text-primary-100">
          {{ formatDate(event.date, true) }}
        </p>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <h2 class="text-xl font-semibold text-gray-700 mb-2">
            Общая информация
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <p>
              <strong class="font-medium text-gray-600">Категория:</strong>
              {{ getCategoryName(event.category_event_idcategory_event) }}
            </p>
            <p>
              <strong class="font-medium text-gray-600"
                >Место проведения:</strong
              >
              {{ getVenueName(event.venue_idvenue) }}
            </p>
            <p>
              <strong class="font-medium text-gray-600">Клиент:</strong>
              {{ getCustomerName(event.customer_idcustomer) }}
            </p>
            <p>
              <strong class="font-medium text-gray-600">Стоимость:</strong>
              {{ formatCurrency(event.cost) }}
            </p>
          </div>
        </div>

        <div v-if="eventParticipants && eventParticipants.length > 0">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">
            Команда мероприятия
          </h2>
          <p class="text-sm text-gray-800 whitespace-pre-wrap">
            {{ displaySelectedTeamMembers }}
          </p>
        </div>

        <!-- Дополнительная информация или секции могут быть здесь -->
      </div>

      <div
        class="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-3"
      >
        <router-link
          :to="{ name: 'TodoList', params: { eventId: event.idevent } }"
          class="btn-primary flex-grow sm:flex-grow-0 flex items-center justify-center whitespace-nowrap"
        >
          <span class="material-symbols-outlined md:mr-2">checklist</span>
          <span class="hidden md:inline">Чек-лист</span>
        </router-link>

        <div
          class="flex flex-wrap gap-3 sm:flex-nowrap flex-grow sm:flex-grow-0 justify-center sm:justify-end"
        >
          <button
            @click="openEditEventModal(event)"
            class="btn-secondary flex-grow sm:flex-grow-0 flex items-center justify-center whitespace-nowrap"
          >
            <span class="material-symbols-outlined md:mr-2">edit</span>
            <span class="hidden md:inline">Править</span>
          </button>
          <button
            @click="confirmDeleteEvent(event)"
            class="btn-danger flex-grow sm:flex-grow-0 flex items-center justify-center whitespace-nowrap"
          >
            <span class="material-symbols-outlined md:mr-2">delete</span>
            <span class="hidden md:inline">Удалить</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Edit Event -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div
        class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl"
        @click.self="closeEditModal"
      >
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          Редактировать мероприятие
        </h2>
        <form
          @submit.prevent="handleUpdateEvent"
          class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
        >
          <div>
            <label for="edit_project_name" class="label-form"
              >Название проекта/мероприятия</label
            >
            <input
              type="text"
              id="edit_project_name"
              v-model="currentEditEvent.project_name"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="edit_date" class="label-form">Дата и время</label>
            <input
              type="datetime-local"
              id="edit_date"
              v-model="currentEditEvent.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="edit_category_event_idcategory_event" class="label-form"
              >Категория</label
            >
            <select
              id="edit_category_event_idcategory_event"
              v-model.number="currentEditEvent.category_event_idcategory_event"
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
            <label for="edit_venue_idvenue" class="label-form">Место</label>
            <select
              id="edit_venue_idvenue"
              v-model.number="currentEditEvent.venue_idvenue"
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
            <label for="edit_customer_idcustomer" class="label-form"
              >Клиент</label
            >
            <select
              id="edit_customer_idcustomer"
              v-model.number="currentEditEvent.customer_idcustomer"
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
            <label for="edit_cost" class="label-form">Стоимость</label>
            <input
              type="number"
              step="0.01"
              id="edit_cost"
              v-model.number="currentEditEvent.cost"
              class="input-field"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="label-form">Команда мероприятия</label>
            <div
              v-if="
                currentEditEvent.participants &&
                currentEditEvent.participants.length > 0
              "
              class="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50"
            >
              <div
                v-for="member in currentEditEvent.participants"
                :key="member.uniqueId"
                class="flex items-center justify-between p-2 border-b last:border-b-0 bg-white rounded-sm shadow-xs"
              >
                <span class="text-sm">{{ member.name }}</span>
                <button
                  type="button"
                  @click="removeParticipantFromForm(member.uniqueId)"
                  class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors duration-150"
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
              class="mt-3 btn-form-secondary text-sm py-1.5 px-3 flex items-center hover:bg-gray-200 active:bg-gray-300"
            >
              <span class="material-symbols-outlined text-base mr-1">add</span>
              Добавить участника в команду
            </button>
          </div>

          <div class="sm:col-span-2 mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeEditModal"
              class="btn-form-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-form-primary">
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Adding Participant to Event -->
    <div
      v-if="isAddParticipantModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
      @click.self="closeAddParticipantModal"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Добавить участника в команду</h3>
        <input
          type="text"
          v-model="participantSearchQuery"
          placeholder="Поиск по имени или роли..."
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
              <div>
                <p>{{ member.name }}</p>
                <p>
                  {{ member.role }}
                  <span class="text-gray-500">({{ member.type }})</span>
                </p>
              </div>
            </li>
          </ul>
          <p v-else class="p-3 text-sm text-gray-500 text-center">
            {{
              participantSearchQuery
                ? "Участники не найдены."
                : "Все доступные участники уже добавлены или список пуст."
            }}
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
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "@/services/api.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import NProgress from "nprogress";

const props = defineProps({
  eventId: {
    type: [String, Number],
    required: true,
  },
});

const route = useRoute();
const router = useRouter();

const event = ref(null);
const eventParticipants = ref([]);
const loading = ref(true);
const isEditModalOpen = ref(false);
const currentEditEvent = ref({});
const isAddParticipantModalOpen = ref(false);
const participantSearchQuery = ref("");

// Списки для выпадающих меню в модалке редактирования
const eventCategories = ref([]);
const venuesList = ref([]);
const customersList = ref([]);

// Наш новый объединенный список всех, кого можно добавить в команду
const allTeamMembers = ref([]);

const filteredTeamMembers = computed(() => {
  if (!isAddParticipantModalOpen.value) {
    return [];
  }

  const participantsInForm = currentEditEvent.value?.participants || [];
  if (!participantsInForm.length) {
    return allTeamMembers.value;
  }

  const addedIds = new Set(participantsInForm.map((p) => p.uniqueId));
  return allTeamMembers.value.filter(
    (member) => !addedIds.has(member.uniqueId)
  );
});

const loadAllData = async () => {
  loading.value = true;
  NProgress.start();
  try {
    const eventId = route.params.eventId;

    // Сначала получаем основное событие
    const eventRes = await apiService.getEvent(eventId);
    if (eventRes.success) {
      event.value = eventRes.data;
    } else {
      // Если событие не найдено, нет смысла грузить остальное
      console.error("Failed to load event:", eventRes.message);
      event.value = null;
      throw new Error(eventRes.message);
    }

    // Теперь, когда событие есть, грузим все остальное
    const [
      participantsRes,
      teamMembersRes,
      categoriesRes,
      venuesRes,
      customersRes,
    ] = await Promise.all([
      apiService.getEventParticipants(eventId),
      apiService.getTeamMembers(),
      apiService.getEventCategories(),
      apiService.getVenues(),
      apiService.getCustomers(),
    ]);

    // Присваиваем загруженные данные
    if (participantsRes.success) {
      eventParticipants.value = participantsRes.data;
    } else {
      eventParticipants.value = [];
    }
    event.value.participants = eventParticipants.value; // Добавляем участников к событию

    if (teamMembersRes.success) {
      allTeamMembers.value = teamMembersRes.data;
    } else {
      allTeamMembers.value = [];
    }

    if (categoriesRes.success) {
      eventCategories.value = categoriesRes.data;
    } else {
      eventCategories.value = [];
    }

    if (venuesRes.success) {
      venuesList.value = venuesRes.data;
    } else {
      venuesList.value = [];
    }

    if (customersRes.success) {
      customersList.value = customersRes.data;
    } else {
      customersList.value = [];
    }
  } catch (error) {
    console.error("Error loading data for EventDetail:", error);
    event.value = null; // Убедимся, что при любой ошибке event сброшен
  } finally {
    loading.value = false;
    NProgress.done();
  }
};

onMounted(() => {
  loadAllData();
});

// --- ЛОГИКА ОТОБРАЖЕНИЯ (для главной страницы, не модалки) ---
const getCategoryName = (id) =>
  eventCategories.value.find((c) => c.idcategory_event === id)?.name ||
  "Не указана";
const getVenueName = (id) =>
  venuesList.value.find((v) => v.idvenue === id)?.name_venue || "Не указано";
const getCustomerName = (id) =>
  customersList.value.find((c) => c.idcustomer === id)?.name_customer ||
  "Не указан";

// --- ЛОГИКА РЕДАКТИРОВАНИЯ ---
const openEditEventModal = (eventToEdit) => {
  const dateForInput = eventToEdit.date
    ? new Date(eventToEdit.date).toISOString().slice(0, 16)
    : "";
  currentEditEvent.value = { ...eventToEdit, date: dateForInput };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentEditEvent.value = null;
};

const handleUpdateEvent = async () => {
  if (!currentEditEvent.value || !currentEditEvent.value.idevent) return;
  try {
    const response = await apiService.updateEvent(
      currentEditEvent.value.idevent,
      currentEditEvent.value
    );
    if (response.success) {
      await loadAllData();
      closeEditModal();
    } else {
      console.error("Failed to update event:", response.message);
    }
  } catch (error) {
    console.error("Error saving event:", error);
  }
};

// TODO: Реализовать логику удаления
const confirmDeleteEvent = (eventToDelete) => {
  console.log("Delete not implemented", eventToDelete);
};

const openAddParticipantModal = () => {
  isAddParticipantModalOpen.value = true;
};

const closeAddParticipantModal = () => {
  isAddParticipantModalOpen.value = false;
};

function addParticipantToForm(member) {
  if (!currentEditEvent.value.participants) {
    currentEditEvent.value.participants = [];
  }
  const isAlreadyAdded = currentEditEvent.value.participants.some(
    (p) => p.uniqueId === member.uniqueId
  );
  if (!isAlreadyAdded) {
    currentEditEvent.value.participants.push(member);
  } else {
    alert("Этот участник уже в команде.");
  }
}

function removeParticipantFromForm(participantUniqueId) {
  if (currentEditEvent.value.participants) {
    currentEditEvent.value.participants =
      currentEditEvent.value.participants.filter(
        (p) => p.uniqueId !== participantUniqueId
      );
  }
}

const getTeamMemberNameById = (uniqueId) => {
  const member = allTeamMembers.value.find((m) => m.uniqueId === uniqueId);
  return member ? member.name : "Неизвестный участник";
};

const displaySelectedTeamMembers = computed(() => {
  if (
    event.value &&
    event.value.participants &&
    event.value.participants.length > 0
  ) {
    return event.value.participants
      .map((p) => getTeamMemberNameById(p.uniqueId))
      .join(", ");
  }
  return "Нет данных о команде";
});
</script>

<style scoped>
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-danger {
  @apply bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-form-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200;
}
.btn-form-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200;
}
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
</style>
