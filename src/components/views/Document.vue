<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Документы</h1>
      <button @click="openAddModal" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить документ</span>
      </button>
    </div>

    <!-- Фильтры -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div>
        <label for="eventFilter" class="label-form"
          >Фильтр по мероприятию:</label
        >
        <select
          id="eventFilter"
          v-model="selectedEventId"
          class="input-field w-full"
        >
          <option :value="null">Все мероприятия</option>
          <option
            v-for="event_item in eventsList"
            :key="event_item.idevent"
            :value="event_item.idevent"
          >
            {{ event_item.project_name }}
          </option>
        </select>
      </div>
      <div>
        <label for="docSearch" class="label-form"
          >Поиск по названию/номеру:</label
        >
        <input
          type="text"
          id="docSearch"
          v-model="searchQuery"
          placeholder="Введите название или номер..."
          class="input-field w-full"
        />
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"
      ></div>
      <p class="mt-4 text-gray-600">Загрузка документов...</p>
    </div>
    <div
      v-else-if="!documents.length"
      class="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm"
    >
      <p>Документы еще не добавлены.</p>
    </div>
    <div
      v-else-if="Object.keys(groupedDocuments).length === 0"
      class="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm"
    >
      <p>Документы, соответствующие вашим фильтрам, не найдены.</p>
    </div>

    <div v-else>
      <div
        v-for="(yearGroup, year) in groupedDocuments"
        :key="year"
        class="mb-8"
      >
        <h2 @click="toggleGroup(`year-${year}`)" class="year-header">
          {{ year }} год
          <span
            class="material-symbols-outlined icon-toggle"
            :class="{ 'rotate-180': expandedGroups.has(`year-${year}`) }"
            >expand_more</span
          >
        </h2>
        <div v-if="expandedGroups.has(`year-${year}`)">
          <div
            v-for="(monthGroup, monthName) in yearGroup"
            :key="monthName"
            class="mb-6 ml-4 md:ml-6"
          >
            <h3
              @click="toggleGroup(`month-${year}-${monthName}`)"
              class="month-header"
            >
              {{ monthName }}
              <span
                class="material-symbols-outlined icon-toggle"
                :class="{
                  'rotate-180': expandedGroups.has(
                    `month-${year}-${monthName}`
                  ),
                }"
                >expand_more</span
              >
            </h3>
            <div
              v-if="expandedGroups.has(`month-${year}-${monthName}`)"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div
                v-for="doc in monthGroup"
                :key="doc.iddocument"
                class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                <div class="p-4 bg-primary-50">
                  <h3
                    class="font-semibold text-lg text-primary-700 truncate"
                    :title="doc.name"
                  >
                    {{ doc.name || "Документ без названия" }}
                  </h3>
                  <p
                    v-if="doc.document_number"
                    class="text-sm text-primary-600"
                  >
                    № {{ doc.document_number }}
                  </p>
                </div>
                <div class="p-4 space-y-2 flex-grow">
                  <p class="text-sm">
                    <strong class="font-medium">Событие:</strong>
                    {{ doc.project_name }}
                  </p>
                  <p class="text-sm">
                    <strong class="font-medium">Тип:</strong>
                    {{ getDocumentTypeLabel(doc.type) }}
                  </p>
                  <p class="text-sm">
                    <strong class="font-medium">Дата:</strong>
                    {{ formatDate(doc.date) }}
                  </p>
                </div>
                <div
                  class="p-4 border-t border-gray-200 bg-gray-50 flex justify-end items-center"
                >
                  <div class="flex space-x-3">
                    <button
                      @click="downloadDocument(doc.iddocument)"
                      class="btn-icon-text text-green-600 hover:text-green-800"
                      title="Скачать PDF"
                    >
                      <span class="material-symbols-outlined text-lg"
                        >download</span
                      >
                      <span class="text-sm hidden sm:inline">Скачать</span>
                    </button>
                    <button
                      @click="openEditModal(doc)"
                      class="btn-icon-text text-primary-600 hover:text-primary-800"
                    >
                      <span class="material-symbols-outlined text-lg"
                        >edit</span
                      >
                      <span class="text-sm hidden sm:inline">Изменить</span>
                    </button>
                    <button
                      @click="confirmDeleteItem(doc.iddocument)"
                      class="btn-icon-text text-red-500 hover:text-red-700"
                    >
                      <span class="material-symbols-outlined text-lg"
                        >delete</span
                      >
                      <span class="text-sm hidden sm:inline">Удалить</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditMode ? "Редактировать документ" : "Добавить документ" }}
        </h2>
        <form
          @submit.prevent="saveDocument"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div v-if="!isEditMode" class="md:col-span-2">
            <label for="template" class="label-form"
              >Шаблон (опционально)</label
            >
            <select
              id="template"
              v-model="selectedTemplateId"
              class="input-field"
            >
              <option :value="null">Без шаблона</option>
              <option
                v-for="template in documentTemplates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="event_idevent" class="label-form">Событие</label>
            <select
              id="event_idevent"
              v-model.number="currentDocument.event_idevent"
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите событие</option>
              <option
                v-for="event_item in eventsList"
                :key="event_item.idevent"
                :value="event_item.idevent"
              >
                {{ event_item.project_name }}
              </option>
            </select>
          </div>
          <div>
            <label for="name" class="label-form">Название документа</label>
            <input
              type="text"
              id="name"
              v-model="currentDocument.name"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="document_number" class="label-form">Номер</label>
            <input
              type="text"
              id="document_number"
              v-model="currentDocument.document_number"
              class="input-field"
            />
          </div>
          <div>
            <label for="date" class="label-form">Дата документа</label>
            <input
              type="date"
              id="date"
              v-model="currentDocument.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="type" class="label-form">Тип</label>
            <select
              id="type"
              v-model="currentDocument.type"
              required
              class="input-field"
            >
              <option value="CONTRACT">Договор</option>
              <option value="ACT">Акт</option>
              <option value="OTHER">Другое</option>
            </select>
          </div>
          <div>
            <label for="file_path" class="label-form">Ссылка на файл</label>
            <input
              type="url"
              id="file_path"
              v-model="currentDocument.file_path"
              placeholder="https://..."
              class="input-field"
            />
          </div>
          <div class="md:col-span-2 mt-6 flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditMode ? "Сохранить" : "Добавить" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import apiService from "@/services/api.service";
import { useAuthStore } from "@/store/auth.store";
import NProgress from "nprogress";

const documents = ref([]);
const eventsList = ref([]);
const documentTemplates = ref([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentDocument = ref({});
const selectedEventId = ref(null);
const searchQuery = ref("");
const selectedTemplateId = ref(null);

const expandedGroups = ref(new Set());
const authStore = useAuthStore();

const defaultDocument = {
  event_idevent: null,
  name: "",
  document_number: "",
  date: new Date().toISOString().slice(0, 10),
  type: "CONTRACT",
  file_path: "",
};

const documentTypeLabels = {
  CONTRACT: "Договор",
  ACT: "Акт",
  OTHER: "Другое",
};
const getDocumentTypeLabel = (type) => documentTypeLabels[type] || type;

async function loadPrerequisites() {
  try {
    const [eventsRes, templatesRes] = await Promise.all([
      apiService.getEvents(),
      apiService.getDocumentTemplates(),
    ]);
    if (eventsRes.data.success) {
      eventsList.value = eventsRes.data.data;
    }
    if (templatesRes.data.success) {
      documentTemplates.value = templatesRes.data.data;
    }
  } catch (error) {
    console.error("Error loading prerequisites:", error);
  }
}

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      loadDocuments();
      loadPrerequisites();
    } else {
      documents.value = [];
      eventsList.value = [];
      documentTemplates.value = [];
    }
  },
  { immediate: true }
);

async function loadDocuments() {
  isLoading.value = true;
  NProgress.start();
  try {
    const docsResponse = await apiService.getDocuments();
    if (docsResponse.success) {
      documents.value = docsResponse.data;
    }

    // Automatically expand the current year and month
    if (documents.value.length > 0) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthName = now.toLocaleString("ru-RU", { month: "long" });
      expandedGroups.value.add(`year-${currentYear}`);
      expandedGroups.value.add(`month-${currentYear}-${currentMonthName}`);
    }
  } catch (error) {
    console.error("Failed to load documents:", error);
  } finally {
    isLoading.value = false;
    NProgress.done();
  }
}

const filteredDocuments = computed(() => {
  let items = documents.value;
  if (selectedEventId.value) {
    items = items.filter((doc) => doc.event_idevent === selectedEventId.value);
  }
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase();
    items = items.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lowerQuery) ||
        (doc.document_number &&
          doc.document_number.toLowerCase().includes(lowerQuery))
    );
  }
  return items;
});

const groupedDocuments = computed(() => {
  return filteredDocuments.value.reduce((acc, doc) => {
    const date = new Date(doc.date);
    const year = date.getFullYear();
    const monthName = date.toLocaleString("ru-RU", { month: "long" });

    if (!acc[year]) acc[year] = {};
    if (!acc[year][monthName]) acc[year][monthName] = [];

    acc[year][monthName].push(doc);
    return acc;
  }, {});
});

function toggleGroup(groupKey) {
  if (expandedGroups.value.has(groupKey)) {
    expandedGroups.value.delete(groupKey);
  } else {
    expandedGroups.value.add(groupKey);
  }
}

function openAddModal() {
  isEditMode.value = false;
  currentDocument.value = { ...defaultDocument };
  selectedTemplateId.value = null;
  isModalOpen.value = true;
}

function openEditModal(doc) {
  isEditMode.value = true;
  currentDocument.value = { ...doc, date: doc.date.slice(0, 10) };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

watch(selectedTemplateId, (newTemplateId) => {
  const resetToDefault = () => {
    currentDocument.value.name = defaultDocument.name;
    currentDocument.value.type = defaultDocument.type;
    currentDocument.value.document_number = defaultDocument.document_number;
  };

  if (isEditMode.value) return;

  if (!newTemplateId) {
    resetToDefault();
    return;
  }

  const template = documentTemplates.value.find((t) => t.id === newTemplateId);
  if (template) {
    currentDocument.value.name = template.name;
    currentDocument.value.type = template.type;

    // Auto-numbering logic
    if (template.prefix) {
      const year = new Date().getFullYear();
      const prefix = template.prefix;
      const regex = new RegExp(`^${prefix}-${year}/(\\d+)$`);

      const maxNum = documents.value.reduce((max, doc) => {
        if (doc.document_number) {
          const match = doc.document_number.match(regex);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            return Math.max(max, num);
          }
        }
        return max;
      }, 0);

      currentDocument.value.document_number = `${prefix}-${year}/${maxNum + 1}`;
    } else {
      currentDocument.value.document_number = "";
    }
  }
});

async function saveDocument() {
  NProgress.start();
  try {
    if (isEditMode.value) {
      await apiService.updateDocument(
        currentDocument.value.iddocument,
        currentDocument.value
      );
    } else {
      await apiService.createDocument(currentDocument.value);
    }
    await loadDocuments();
    closeModal();
  } catch (error) {
    console.error("Failed to save document:", error);
    alert("Ошибка сохранения документа.");
  } finally {
    NProgress.done();
  }
}

async function confirmDeleteItem(id) {
  if (confirm("Вы уверены, что хотите удалить этот документ?")) {
    NProgress.start();
    try {
      await apiService.deleteDocument(id);
      await loadDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Ошибка удаления документа.");
    } finally {
      NProgress.done();
    }
  }
}

async function downloadDocument(docId) {
  if (!docId) return;
  NProgress.start();
  try {
    await apiService.downloadDocument(docId);
  } catch (error) {
    console.error("Failed to download document:", error);
    alert(`Ошибка при скачивании документа: ${error.message}`);
  } finally {
    NProgress.done();
  }
}

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};

onMounted(() => {
  loadInitialData();
});

const loadInitialData = async () => {
  isLoading.value = true;
  try {
    const [docsRes, eventsRes, templatesRes] = await Promise.all([
      apiService.getDocuments(),
      apiService.getEvents(),
      apiService.getDocumentTemplates(),
    ]);
    documents.value = docsRes.data.data;
    eventsList.value = eventsRes.data.data;
    documentTemplates.value = templatesRes.data.data;
  } catch (error) {
    console.error("Failed to load initial data for documents page:", error);
  } finally {
    isLoading.value = false;
  }
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
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200;
}
.btn-icon-text {
  @apply flex items-center space-x-1 transition-colors duration-200;
}

.year-header {
  @apply text-2xl font-semibold text-gray-700 mb-4 sticky top-0 bg-white py-2 z-10 border-b cursor-pointer flex justify-between items-center select-none;
}
.month-header {
  @apply text-xl font-medium text-gray-600 mb-3 cursor-pointer flex justify-between items-center select-none;
}
.icon-toggle {
  @apply text-gray-500 transform transition-transform duration-200;
}

.modal-overlay {
  @apply fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4;
}
.modal-content {
  @apply bg-white p-8 rounded-lg shadow-xl w-full max-w-lg;
}
</style>
