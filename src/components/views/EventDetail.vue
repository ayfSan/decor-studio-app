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

        <div
          v-if="
            event.participants ||
            (event.selectedTeamMemberIds &&
              event.selectedTeamMemberIds.length > 0)
          "
        >
          <h2 class="text-xl font-semibold text-gray-700 mb-2">
            Команда мероприятия / Организаторы
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
            <span class="hidden md:inline">Редактировать</span>
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
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          Редактировать мероприятие
        </h2>
        <form
          @submit.prevent="saveEditedEvent"
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
                {{ venue.name }}
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
                {{ customer.name }}
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
            <label class="label-form">Команда мероприятия / Организаторы</label>
            <div
              v-if="
                currentEditEvent.selectedTeamMemberIds &&
                currentEditEvent.selectedTeamMemberIds.length > 0
              "
              class="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50"
            >
              <div
                v-for="memberId in currentEditEvent.selectedTeamMemberIds"
                :key="memberId"
                class="flex items-center justify-between p-2 border-b last:border-b-0 bg-white rounded-sm shadow-xs"
              >
                <span class="text-sm">{{
                  getTeamMemberNameById(memberId)
                }}</span>
                <button
                  type="button"
                  @click="removeParticipantFromEvent(memberId)"
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
              @click="closeEditEventModal"
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
          <ul v-if="availableTeamOptions.length > 0">
            <li
              v-for="option in availableTeamOptions"
              :key="option.value"
              @click="addParticipantToEvent(option.value)"
              class="px-3 py-2 hover:bg-primary-50 cursor-pointer border-b last:border-b-0"
            >
              {{ option.text }}
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

const props = defineProps({
  eventId: {
    type: [String, Number],
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const event = ref(null);
const loading = ref(true);
const isEditModalOpen = ref(false);
const currentEditEvent = ref({});

// State for new participant selection modal
const isAddParticipantModalOpen = ref(false);
const participantSearchQuery = ref("");

// Эти данные должны приходить из API или общего хранилища.
// Пока используем моки, аналогичные Events.vue для демонстрации.
const allEvents = ref([
  {
    idevent: 1,
    date: "2024-07-15T14:00:00.000Z",
    project_name: "Свадьба Анны и Петра",
    category_event_idcategory_event: 1,
    venue_idvenue: 1,
    customer_idcustomer: 2,
    cost: 250000,
    // participants: "Молодожены, гости (50 чел), ведущий, фотограф, видеограф.", // Old field
    selectedTeamMemberIds: ["member-1", "user-2"], // Example new field
  },
  {
    idevent: 2,
    date: "2024-08-20T18:00:00.000Z",
    project_name: 'Юбилей компании "ТехноПрорыв"',
    category_event_idcategory_event: 2,
    venue_idvenue: 2,
    customer_idcustomer: 1,
    cost: 500000,
    // participants: "Сотрудники компании (100 чел), руководство, приглашенные артисты.",
    selectedTeamMemberIds: ["member-2", "member-3"],
  },
  {
    idevent: 3,
    date: "2023-12-10T12:00:00.000Z",
    project_name: "Новогодний корпоратив",
    category_event_idcategory_event: 2,
    venue_idvenue: 1,
    customer_idcustomer: 1,
    cost: 300000,
    selectedTeamMemberIds: [],
  },
  {
    idevent: 4,
    date: "2024-07-25T10:00:00.000Z",
    project_name: "Конференция Разработчиков",
    category_event_idcategory_event: 4,
    venue_idvenue: 3,
    customer_idcustomer: 3,
    cost: 150000,
    selectedTeamMemberIds: ["user-1"],
  },
  {
    idevent: 5,
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    project_name: "День Рождения Ивана",
    category_event_idcategory_event: 3,
    venue_idvenue: 2,
    customer_idcustomer: 3,
    cost: 80000,
    selectedTeamMemberIds: [],
  },
  {
    idevent: 6,
    name: "Стратегическая сессия",
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    category_event_idcategory_event: 2,
    venue_idvenue: 3,
    customer_idcustomer: 1,
    cost: 120000,
    selectedTeamMemberIds: [],
  },
]);

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

// Mock data for Members (team) - for multi-select
const mockMembers = ref([
  { id: "member-1", firstName: "Анна", lastName: "Иванова", role: "Декоратор" },
  {
    id: "member-2",
    firstName: "Петр",
    lastName: "Смирнов",
    role: "Координатор",
  },
  { id: "member-3", firstName: "Мария", lastName: "Козлова", role: "Флорист" },
]);

// Mock data for Users (system users, can also be team members) - for multi-select
const mockUsers = ref([
  {
    id: "user-1",
    telegram_id: 1020152129,
    username: "cammbucho",
    first_name: "ИП Дачница",
    last_name: "Баба Дуся",
    role: "Администратор",
  },
  {
    id: "user-2",
    telegram_id: 123456789,
    username: "test_user",
    first_name: "Тестовый",
    last_name: "Пользователь",
    role: "Менеджер",
  },
]);

onMounted(() => {
  const foundEvent = allEvents.value.find(
    (e) => e.idevent === Number(props.eventId)
  );
  if (foundEvent) {
    event.value = { ...foundEvent };
    // Ensure selectedTeamMemberIds is initialized as an array
    if (!Array.isArray(event.value.selectedTeamMemberIds)) {
      event.value.selectedTeamMemberIds = [];
    }
  }
  loading.value = false;
});

const getCategoryName = (id) => {
  const category = eventCategories.value.find(
    (cat) => cat.idcategory_event === id
  );
  return category ? category.name : "Не указана";
};

const getVenueName = (id) => {
  const venue = venuesList.value.find((v) => v.idvenue === id);
  return venue ? venue.name : "Не указано";
};

const getCustomerName = (id) => {
  const customer = customersList.value.find((c) => c.idcustomer === id);
  return customer ? customer.name : "Не указан";
};

const internalTeamSelectionOptions = computed(() => {
  // Renamed to avoid conflict
  const membersFormatted = mockMembers.value.map((m) => ({
    value: m.id,
    text: `${m.firstName} ${m.lastName} (Участник - ${m.role})`,
  }));
  const usersFormatted = mockUsers.value.map((u) => ({
    value: u.id,
    text: `${u.first_name || ""} ${u.last_name || u.username} (Пользователь - ${
      u.role
    })`,
  }));
  return [...membersFormatted, ...usersFormatted].sort((a, b) =>
    a.text.localeCompare(b.text)
  );
});

const getTeamMemberNameById = (id) => {
  const selectedOption = internalTeamSelectionOptions.value.find(
    (opt) => opt.value === id
  );
  return selectedOption
    ? selectedOption.text.split(" (")[0]
    : "Неизвестный участник";
};

const displaySelectedTeamMembers = computed(() => {
  if (
    event.value &&
    Array.isArray(event.value.selectedTeamMemberIds) &&
    event.value.selectedTeamMemberIds.length > 0
  ) {
    return event.value.selectedTeamMemberIds
      .map((id) => getTeamMemberNameById(id))
      .join(", ");
  }
  return "Нет данных о команде";
});

function formatDate(dateString, full = false) {
  if (!dateString) return "N/A";
  const options = full
    ? {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : { year: "numeric", month: "long", day: "numeric" };
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

// Функции для модального окна редактирования
function openEditEventModal(eventToEdit) {
  const dateForInput = eventToEdit.date
    ? new Date(eventToEdit.date).toISOString().slice(0, 16)
    : "";
  currentEditEvent.value = {
    ...eventToEdit,
    date: dateForInput,
    selectedTeamMemberIds: Array.isArray(eventToEdit.selectedTeamMemberIds)
      ? [...eventToEdit.selectedTeamMemberIds]
      : [],
  };
  isEditModalOpen.value = true;
}

function closeEditEventModal() {
  isEditModalOpen.value = false;
  currentEditEvent.value = {};
  closeAddParticipantModal(); // Close participant modal if open
}

function saveEditedEvent() {
  if (!currentEditEvent.value.idevent) return;

  if (currentEditEvent.value.date) {
    const localDate = new Date(currentEditEvent.value.date);
    currentEditEvent.value.date = new Date(localDate).toISOString();
  }

  // selectedTeamMemberIds is already part of currentEditEvent.value

  const index = allEvents.value.findIndex(
    (e) => e.idevent === currentEditEvent.value.idevent
  );
  if (index !== -1) {
    allEvents.value[index] = { ...currentEditEvent.value };
    event.value = { ...currentEditEvent.value };
  }
  closeEditEventModal();
}

function confirmDeleteEvent(eventToDelete) {
  if (
    confirm(
      `Вы уверены, что хотите удалить мероприятие "${eventToDelete.project_name}"?`
    )
  ) {
    deleteEvent(eventToDelete);
  }
}

function deleteEvent(eventToDelete) {
  allEvents.value = allEvents.value.filter(
    (e) => e.idevent !== eventToDelete.idevent
  );
  console.log("Event deleted (mock):", eventToDelete.idevent);
  router.push("/events");
}

// --- New Participant Selection Logic ---
function openAddParticipantModal() {
  participantSearchQuery.value = ""; // Reset search
  isAddParticipantModalOpen.value = true;
}

function closeAddParticipantModal() {
  isAddParticipantModalOpen.value = false;
}

const availableTeamOptions = computed(() => {
  const currentSelectedIds = currentEditEvent.value.selectedTeamMemberIds || [];
  let options = internalTeamSelectionOptions.value.filter(
    (opt) => !currentSelectedIds.includes(opt.value)
  );

  if (participantSearchQuery.value) {
    const lowerQuery = participantSearchQuery.value.toLowerCase();
    options = options.filter((opt) =>
      opt.text.toLowerCase().includes(lowerQuery)
    );
  }
  return options;
});

function addParticipantToEvent(participantId) {
  if (!currentEditEvent.value.selectedTeamMemberIds) {
    currentEditEvent.value.selectedTeamMemberIds = [];
  }
  if (!currentEditEvent.value.selectedTeamMemberIds.includes(participantId)) {
    currentEditEvent.value.selectedTeamMemberIds.push(participantId);
  }
  // Optionally close modal after selection, or allow multiple additions
  // closeAddParticipantModal();
}

function removeParticipantFromEvent(participantId) {
  if (currentEditEvent.value.selectedTeamMemberIds) {
    currentEditEvent.value.selectedTeamMemberIds =
      currentEditEvent.value.selectedTeamMemberIds.filter(
        (id) => id !== participantId
      );
  }
}
// --- End New Participant Selection Logic ---
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
