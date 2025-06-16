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
      class="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden"
    >
      <div class="bg-primary-600 text-white p-6">
        <h1 class="text-3xl font-bold mb-1">
          {{ event.project_name || "Мероприятие без названия" }}
        </h1>
        <p class="text-lg text-primary-100">
          {{ formatDate(event.date, true) }}
        </p>
      </div>

      <div class="p-6 space-y-6">
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

        <!-- Documents Section -->
        <div class="border-t pt-5">
          <h2 class="text-xl font-semibold text-gray-700 mb-3">
            Документы по мероприятию
          </h2>
          <div v-if="documentsLoading" class="text-gray-500 text-sm">
            Загрузка документов...
          </div>
          <div
            v-else-if="eventDocuments.length === 0"
            class="text-sm text-gray-500 bg-gray-50 p-4 rounded-md"
          >
            К этому мероприятию еще не привязано ни одного документа.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="doc in eventDocuments"
              :key="doc.iddocument"
              class="bg-gray-50 p-3 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 hover:shadow-sm"
            >
              <div class="flex items-center overflow-hidden mr-4">
                <span
                  class="material-symbols-outlined text-gray-500 mr-3 hidden sm:inline"
                  >article</span
                >
                <div class="overflow-hidden">
                  <p
                    class="font-medium text-gray-800 truncate"
                    :title="doc.name"
                  >
                    {{ doc.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    № {{ doc.document_number }} от
                    {{ formatDate(doc.date, false) }}
                  </p>
                </div>
              </div>
              <button
                @click="downloadDocument(doc.iddocument)"
                class="btn-secondary btn-sm flex-shrink-0"
              >
                Скачать
              </button>
            </div>
          </div>
        </div>
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
            @click="openGenerateDocModal"
            class="btn-secondary flex-grow sm:flex-grow-0 flex items-center justify-center whitespace-nowrap"
          >
            <span class="material-symbols-outlined md:mr-2">description</span>
            <span class="hidden md:inline">Создать документ</span>
          </button>
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
      @click.self="closeEditModal"
    >
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl">
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

    <!-- Modal for Generate Document -->
    <div
      v-if="isGenerateDocModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
      @click.self="closeGenerateDocModal"
    >
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          Создание документа
        </h2>
        <form @submit.prevent="handleGenerateDocument">
          <div class="mb-4">
            <label for="template-select" class="label-form"
              >Выберите шаблон</label
            >
            <select
              id="template-select"
              v-model="selectedTemplateId"
              required
              class="input-field"
            >
              <option :value="null" disabled>-- Выберите шаблон --</option>
              <option
                v-for="template in documentTemplates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }} ({{ template.type }})
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-4 mt-8">
            <button
              type="button"
              @click="closeGenerateDocModal"
              class="btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary" :disabled="isGenerating">
              <span v-if="isGenerating">Создание...</span>
              <span v-else>Создать</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.store";
import apiService from "@/services/api.service.js";
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
const eventCategories = ref([]);
const venuesList = ref([]);
const customersList = ref([]);
const eventDocuments = ref([]);
const documentTemplates = ref([]);
const teamMembers = ref([]);

const loading = ref(true);
const documentsLoading = ref(true);

const isEditModalOpen = ref(false);
const currentEditEvent = ref(null);

const isAddParticipantModalOpen = ref(false);

const isGenerateDocModalOpen = ref(false);
const selectedTemplateId = ref(null);
const isGenerating = ref(false);

const participantSearchQuery = ref("");

const eventParticipants = computed(() => event.value?.participants || []);

const filteredTeamMembers = computed(() => {
  if (!isAddParticipantModalOpen.value || !currentEditEvent.value) {
    return [];
  }

  const participantsInFormIds = new Set(
    (currentEditEvent.value.participants || []).map((p) => p.uniqueId)
  );

  let availableMembers = teamMembers.value.filter(
    (member) => !participantsInFormIds.has(member.uniqueId)
  );

  if (participantSearchQuery.value) {
    const query = participantSearchQuery.value.toLowerCase();
    availableMembers = availableMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        (member.specialty && member.specialty.toLowerCase().includes(query))
    );
  }

  return availableMembers;
});

const fetchEventDocuments = async () => {
  documentsLoading.value = true;
  try {
    const res = await apiService.getEventDocuments(props.eventId);
    if (res.data.success) {
      eventDocuments.value = res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch event documents:", error);
    eventDocuments.value = [];
  } finally {
    documentsLoading.value = false;
  }
};

const downloadDocument = async (docId) => {
  try {
    await apiService.downloadDocument(docId);
  } catch (error) {
    console.error("Failed to download document:", error);
    alert(
      `Ошибка при скачивании документа: ${
        error.message || "Неизвестная ошибка"
      }`
    );
  }
};

const handleGenerateDocument = async () => {
  if (!selectedTemplateId.value) {
    alert("Пожалуйста, выберите шаблон.");
    return;
  }
  isGenerating.value = true;
  try {
    const response = await apiService.generateDocument(
      props.eventId,
      selectedTemplateId.value
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let fileName = `document-${props.eventId}.pdf`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
    }

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    closeGenerateDocModal();
    await fetchEventDocuments();
  } catch (error) {
    console.error("Error generating document:", error);
    alert("Не удалось сгенерировать документ.");
  } finally {
    isGenerating.value = false;
  }
};

const fetchEventData = async () => {
  if (!props.eventId) {
    loading.value = false;
    return;
  }
  loading.value = true;
  NProgress.start();
  try {
    const response = await apiService.getEvent(props.eventId);
    if (response.data.success) {
      event.value = response.data.data;
    } else {
      console.error("Event not found or failed to load", response.data.message);
      event.value = null;
    }
  } catch (error) {
    console.error("Error loading event data:", error);
    event.value = null;
  } finally {
    loading.value = false;
    NProgress.done();
  }
};

const fetchPrerequisites = async () => {
  try {
    const [categoriesRes, venuesRes, customersRes, teamRes] = await Promise.all(
      [
        apiService.getEventCategories(),
        apiService.getVenues(),
        apiService.getCustomers(),
        apiService.getTeamMembers(),
      ]
    );

    if (categoriesRes.data.success)
      eventCategories.value = categoriesRes.data.data;
    if (venuesRes.data.success) venuesList.value = venuesRes.data.data;
    if (customersRes.data.success) customersList.value = customersRes.data.data;
    if (teamRes.data.success) teamMembers.value = teamRes.data.data;
  } catch (error) {
    console.error("Failed to load prerequisites:", error);
  }
};

const openEditEventModal = (eventToEdit) => {
  const dateForInput = eventToEdit.date
    ? new Date(eventToEdit.date).toISOString().slice(0, 16)
    : "";
  const participantsCopy = JSON.parse(
    JSON.stringify(eventToEdit.participants || [])
  );
  currentEditEvent.value = {
    ...eventToEdit,
    date: dateForInput,
    participants: participantsCopy,
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  currentEditEvent.value = null;
};

const handleUpdateEvent = async () => {
  if (!currentEditEvent.value) return;
  try {
    const response = await apiService.updateEvent(
      currentEditEvent.value.idevent,
      currentEditEvent.value
    );
    if (response.data.success) {
      closeEditModal();
      await fetchEventData();
    } else {
      alert(`Ошибка обновления: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error updating event:", error);
    alert("Произошла критическая ошибка при обновлении мероприятия.");
  }
};

const confirmDeleteEvent = async (eventToDelete) => {
  if (
    confirm(
      `Вы уверены, что хотите удалить мероприятие "${eventToDelete.project_name}"? Это действие необратимо.`
    )
  ) {
    NProgress.start();
    try {
      const response = await apiService.deleteEvent(eventToDelete.idevent);
      if (response.data.success) {
        router.push("/events");
      } else {
        alert(`Не удалось удалить мероприятие: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Произошла ошибка при удалении.");
    } finally {
      NProgress.done();
    }
  }
};

const openAddParticipantModal = () => {
  participantSearchQuery.value = "";
  isAddParticipantModalOpen.value = true;
};

const closeAddParticipantModal = () => {
  isAddParticipantModalOpen.value = false;
};

function addParticipantToForm(member) {
  if (!currentEditEvent.value.participants) {
    currentEditEvent.value.participants = [];
  }
  if (
    !currentEditEvent.value.participants.some(
      (p) => p.uniqueId === member.uniqueId
    )
  ) {
    currentEditEvent.value.participants.push(member);
  }
}

function removeParticipantFromForm(participantUniqueId) {
  currentEditEvent.value.participants =
    currentEditEvent.value.participants.filter(
      (p) => p.uniqueId !== participantUniqueId
    );
}

const openGenerateDocModal = () => {
  fetchDocumentTemplates();
  isGenerateDocModalOpen.value = true;
};

const closeGenerateDocModal = () => {
  isGenerateDocModalOpen.value = false;
  selectedTemplateId.value = null;
};

const fetchDocumentTemplates = async () => {
  try {
    const res = await apiService.getDocumentTemplates();
    if (res.data.success) {
      documentTemplates.value = res.data.data;
    } else {
      documentTemplates.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch document templates", error);
    documentTemplates.value = [];
  }
};

onMounted(() => {
  fetchEventData();
  fetchPrerequisites();
  fetchEventDocuments();
});

const getCategoryName = (id) =>
  eventCategories.value.find((c) => c.idcategory_event === id)?.name ||
  "Не указана";
const getVenueName = (id) =>
  venuesList.value.find((v) => v.idvenue === id)?.name_venue || "Не указано";
const getCustomerName = (id) =>
  customersList.value.find((c) => c.idcustomer === id)?.name_customer ||
  "Не указан";

const displaySelectedTeamMembers = computed(() => {
  if (
    Array.isArray(eventParticipants.value) &&
    eventParticipants.value.length > 0
  ) {
    return eventParticipants.value.map((p) => p.name).join(", ");
  }
  if (typeof eventParticipants.value === "string" && eventParticipants.value) {
    return eventParticipants.value;
  }
  return "Команда не назначена.";
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
.btn-sm {
  @apply py-1 px-2 text-sm;
}
</style>
