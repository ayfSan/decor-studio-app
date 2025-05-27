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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-if="events.length === 0"
        class="col-span-full text-center py-10 text-gray-500"
      >
        <p>Нет мероприятий для отображения.</p>
        <p>Нажмите "Новое мероприятие", чтобы добавить.</p>
      </div>
      <div
        v-for="event_item in events"
        :key="event_item.idevent"
        class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
      >
        <div class="bg-primary-50 p-4">
          <h3 class="font-semibold text-lg text-primary-700">
            {{ event_item.project_name || "Мероприятие без названия" }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ formatDate(event_item.date) }}
          </p>
        </div>

        <div class="p-4 space-y-3 flex-grow">
          <p class="text-sm">
            <strong class="font-medium">Категория:</strong>
            {{ getCategoryName(event_item.category_event_idcategory_event) }}
          </p>
          <p class="text-sm">
            <strong class="font-medium">Место:</strong>
            {{ getVenueName(event_item.venue_idvenue) }}
          </p>
          <p class="text-sm">
            <strong class="font-medium">Клиент:</strong>
            {{ getCustomerName(event_item.customer_idcustomer) }}
          </p>
          <p class="text-sm">
            <strong class="font-medium">Стоимость:</strong>
            {{ formatCurrency(event_item.cost) }}
          </p>
          <p class="text-sm">
            <strong class="font-medium">Участники (описание):</strong>
            {{ event_item.participants || "-" }}
          </p>
        </div>

        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-between items-center space-x-2">
            <button
              @click="openEditEventModal(event_item)"
              class="btn-icon-text text-primary-600 hover:text-primary-800"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
              <span class="hidden sm:inline text-sm">Изменить</span>
            </button>
            <button
              @click="goToTodoList(event_item.idevent)"
              class="btn-icon-text text-gray-600 hover:text-gray-800"
            >
              <span class="material-symbols-outlined text-lg">checklist</span>
              <span class="hidden sm:inline text-sm">Чек-лист</span>
            </button>
            <button
              @click="confirmDeleteEvent(event_item)"
              class="btn-icon-text text-red-500 hover:text-red-700"
            >
              <span class="material-symbols-outlined text-lg">delete</span>
              <span class="hidden sm:inline text-sm">Удалить</span>
            </button>
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
    category_event_idcategory_event: 1, // ID for 'Свадьба'
    venue_idvenue: 1, // ID for 'Ресторан "Золотой Дракон"'
    customer_idcustomer: 2, // ID for 'Анна Петрова'
    cost: 500000.0,
    participants: "Молодожены, родители, близкие друзья (около 50 человек)",
  },
  {
    idevent: 2,
    date: "2024-08-20T18:00:00.000Z",
    project_name: 'Юбилей компании "ТехноПрорыв"',
    category_event_idcategory_event: 2, // ID for 'Корпоратив'
    venue_idvenue: 2, // ID for 'Лофт "Атмосфера"'
    customer_idcustomer: 1, // ID for 'ООО "Праздник Плюс"'
    cost: 300000.0,
    participants: "Сотрудники компании (100 человек), руководство",
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

// Helper functions to get names by ID
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

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
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
    events.value.push({ ...currentEvent.value, idevent: Date.now() }); // Replace Date.now() with actual ID
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

// TODO: Fetch actual categories, venues, customers for dropdowns in modal
onMounted(() => {
  console.log("Events component mounted. Fetch related data here if needed.");
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
.btn-icon-text {
  @apply flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors duration-150;
}
</style>
