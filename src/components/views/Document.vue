<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Документы</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить документ</span>
      </button>
    </div>

    <!-- Фильтры -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div>
        <label
          for="eventFilter"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Фильтр по мероприятию:</label
        >
        <select
          id="eventFilter"
          v-model="selectedEventId"
          @change="resetExpandedAndApplyFilter"
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
        <label
          for="docSearch"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Поиск по названию/номеру:</label
        >
        <input
          type="text"
          id="docSearch"
          v-model="searchQuery"
          @input="resetExpandedAndApplyFilter"
          placeholder="Введите название или номер..."
          class="input-field w-full"
        />
      </div>
    </div>

    <div
      v-if="
        !Object.keys(finalGroupedDocuments).length &&
        documents.length > 0 &&
        selectedEventId
      "
      class="text-center py-10 text-gray-500"
    >
      <p>Нет документов для выбранного мероприятия.</p>
    </div>
    <div
      v-else-if="
        !Object.keys(finalGroupedDocuments).length &&
        documents.length > 0 &&
        !selectedEventId &&
        !initialDataLoaded
      "
      class="text-center py-10 text-gray-500"
    >
      <!-- Показываем только если это не первоначальная загрузка без фильтра -->
      <p>
        Нет активных групп документов для отображения по умолчанию. Выберите
        фильтр или измените логику expanded.
      </p>
    </div>
    <div v-else-if="!documents.length" class="text-center py-10 text-gray-500">
      <p>Нет документов для отображения.</p>
    </div>
    <div
      v-else-if="
        Object.keys(finalGroupedDocuments).length === 0 &&
        initialDataLoaded &&
        !selectedEventId
      "
      class="text-center py-10 text-gray-500"
    >
      <p>
        Нет документов, соответствующих критериям для автоматического
        отображения (текущий месяц/год). Попробуйте изменить фильтр.
      </p>
    </div>

    <div v-else>
      <div
        v-for="(yearGroup, year) in finalGroupedDocuments"
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
                v-for="doc in monthGroup"
                :key="doc.iddocument"
                class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                <!-- Заголовок -->
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
                  <p class="text-xs text-gray-500 mt-1">
                    ID: {{ doc.iddocument }}
                  </p>
                </div>

                <!-- Основной контент -->
                <div class="p-4 space-y-2 flex-grow">
                  <p class="text-sm">
                    <strong class="font-medium">Событие:</strong>
                    {{ getEventNameById(doc.event_idevent) }}
                  </p>
                  <p class="text-sm">
                    <strong class="font-medium">Тип:</strong> {{ doc.type }}
                  </p>
                  <p class="text-sm">
                    <strong class="font-medium">Дата:</strong>
                    {{ formatDate(doc.date) }}
                  </p>
                </div>

                <!-- Футер с кнопками и ссылкой -->
                <div
                  class="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <a
                      v-if="doc.file_path && doc.file_path !== '#'"
                      :href="doc.file_path"
                      target="_blank"
                      class="btn-icon-text text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span class="material-symbols-outlined text-lg"
                        >link</span
                      >
                      <span class="text-sm hidden sm:inline">Файл</span>
                    </a>
                    <span v-else class="text-sm text-gray-400">Нет файла</span>
                  </div>
                  <div class="flex space-x-3">
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
                      @click="confirmDeleteItem(doc)"
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
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditMode ? "Редактировать документ" : "Добавить документ" }}
        </h2>
        <form
          @submit.prevent="saveDocument"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
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
            <label for="name" class="label-form">Наименование</label>
            <input
              type="text"
              id="name"
              v-model="currentDocument.name"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="document_number" class="label-form"
              >Номер документа</label
            >
            <input
              type="text"
              id="document_number"
              v-model="currentDocument.document_number"
              required
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
            <label for="type" class="label-form">Тип документа</label>
            <select
              id="type"
              v-model="currentDocument.type"
              required
              class="input-field"
            >
              <option value="ACT">Акт</option>
              <option value="CONTRACT">Договор</option>
              <option value="OTHER">Другое</option>
            </select>
          </div>
          <div>
            <label for="file_path" class="label-form">Путь к файлу (URL)</label>
            <input
              type="url"
              id="file_path"
              v-model="currentDocument.file_path"
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

const documents = ref([
  {
    iddocument: 1,
    event_idevent: 101,
    name: "Договор на оказание услуг",
    document_number: "ДС-001/24",
    date: "2024-05-15",
    type: "CONTRACT",
    file_path: "#",
  },
  {
    iddocument: 2,
    event_idevent: 101,
    name: "Акт выполненных работ",
    document_number: "АВР-001/24",
    date: "2024-06-01",
    type: "ACT",
    file_path: "#",
  },
  {
    iddocument: 3,
    event_idevent: 102,
    name: "Счет-оферта",
    document_number: "СО-005/24",
    date: "2024-05-20",
    type: "OTHER",
    file_path: null,
  },
  {
    iddocument: 4,
    event_idevent: 103,
    name: "Договор на конференцию",
    document_number: "ДК-002/23",
    date: "2023-11-10",
    type: "CONTRACT",
    file_path: "#",
  },
  {
    iddocument: 5,
    event_idevent: 101,
    name: "Доп. соглашение к ДС-001/24",
    document_number: "ДС-001/24/1",
    date: "2024-05-25",
    type: "OTHER",
    file_path: "#",
  },
  {
    iddocument: 6,
    event_idevent: 102,
    name: "Акт для ТехноПрорыв",
    document_number: "АВР-002/24",
    date: new Date().toISOString().slice(0, 10),
    type: "ACT",
    file_path: "#",
  },
]);

// Demo data for events (ideally fetched or passed as prop)
const eventsList = ref([
  { idevent: 101, project_name: "Свадьба Анны и Петра" },
  { idevent: 102, project_name: 'Юбилей компании "ТехноПрорыв"' },
  { idevent: 103, project_name: "Конференция Разработчиков" },
]);

const selectedEventId = ref(null);
const searchQuery = ref(""); // Для текстового поиска
const isModalOpen = ref(false);
const currentDocument = ref({});
const isEditMode = ref(false);
const initialDataLoaded = ref(false);

const expandedGroups = ref({});

const initializeExpandedGroups = (groupsToExpand) => {
  const newExpandedState = {};
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthName =
    currentDate
      .toLocaleString("ru-RU", { month: "long" })
      .charAt(0)
      .toUpperCase() +
    currentDate.toLocaleString("ru-RU", { month: "long" }).slice(1);

  for (const yearKey in groupsToExpand) {
    const year = yearKey;
    if (year === currentYear.toString()) {
      newExpandedState["year-" + year] = true;
      if (groupsToExpand[yearKey][currentMonthName]) {
        newExpandedState["month-" + year + "-" + currentMonthName] = true;
      }
    } else {
      newExpandedState["year-" + year] = false;
    }
    for (const monthKey in groupsToExpand[yearKey]) {
      if (!(year === currentYear.toString() && monthKey === currentMonthName)) {
        if (newExpandedState["month-" + year + "-" + monthKey] === undefined) {
          newExpandedState["month-" + year + "-" + monthKey] = false;
        }
      }
    }
  }
  expandedGroups.value = newExpandedState;
  initialDataLoaded.value = true;
};

const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};

const isGroupExpanded = (groupId) => {
  return expandedGroups.value[groupId] === undefined
    ? false
    : expandedGroups.value[groupId];
};

const resetExpandedGroups = () => {
  initialDataLoaded.value = false;
};

// Новая функция, которая сбрасывает раскрытие и позволяет computed обновиться
const resetExpandedAndApplyFilter = () => {
  initialDataLoaded.value = false;
  // "Трогаем" computed свойство, чтобы оно пересчиталось с новым фильтром/поиском
  // и затем корректно инициализировало expandedGroups
  const _ = finalGroupedDocuments.value;
};

const filteredDocuments = computed(() => {
  let items = documents.value;
  // Фильтр по мероприятию
  if (selectedEventId.value !== null) {
    items = items.filter((doc) => doc.event_idevent === selectedEventId.value);
  }
  // Текстовый поиск
  if (searchQuery.value) {
    const lowerSearchQuery = searchQuery.value.toLowerCase();
    items = items.filter(
      (doc) =>
        (doc.name || "").toLowerCase().includes(lowerSearchQuery) ||
        (doc.document_number || "").toLowerCase().includes(lowerSearchQuery)
    );
  }
  return items;
});

const hasDocumentsAfterFilter = computed(() => {
  return filteredDocuments.value.length > 0;
});

// Переименовываем filteredAndGroupedDocuments в finalGroupedDocuments для ясности
const finalGroupedDocuments = computed(() => {
  const groups = {};
  let itemsToProcess = filteredDocuments.value; // Используем уже отфильтрованные документы

  if (!itemsToProcess.length) {
    if (!initialDataLoaded.value) {
      initializeExpandedGroups({});
    }
    return {};
  }

  const sortedDocuments = [...itemsToProcess].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  for (const doc of sortedDocuments) {
    const date = new Date(doc.date);
    const correctedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    const year = correctedDate.getFullYear();
    const month = correctedDate.toLocaleString("ru-RU", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    if (!groups[year]) {
      groups[year] = {};
    }
    if (!groups[year][capitalizedMonth]) {
      groups[year][capitalizedMonth] = [];
    }
    groups[year][capitalizedMonth].push(doc);
  }

  if (!initialDataLoaded.value || selectedEventId.value !== null) {
    initializeExpandedGroups(groups);
  }
  return groups;
});

watch([selectedEventId, searchQuery], () => {
  // Следим за обоими фильтрами
  resetExpandedAndApplyFilter();
});

onMounted(() => {
  const initialGroups = finalGroupedDocuments.value;
});

const getEventNameById = (eventId) => {
  const event = eventsList.value.find((e) => e.idevent === eventId);
  return event ? event.project_name : "Неизвестное событие";
};

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString(
    "ru-RU"
  );
}

function openAddModal() {
  isEditMode.value = false;
  currentDocument.value = {
    ...defaultDocument,
    date: new Date().toISOString().slice(0, 10),
  };
  isModalOpen.value = true;
}

function openEditModal(doc) {
  isEditMode.value = true;
  currentDocument.value = { ...doc };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveDocument() {
  if (isEditMode.value) {
    const index = documents.value.findIndex(
      (d) => d.iddocument === currentDocument.value.iddocument
    );
    if (index !== -1) {
      documents.value[index] = { ...currentDocument.value };
    }
  } else {
    currentDocument.value.iddocument =
      documents.value.length > 0
        ? Math.max(...documents.value.map((d) => d.iddocument)) + 1
        : 1;
    documents.value.push({ ...currentDocument.value });
  }
  initialDataLoaded.value = false;
  closeModal();
}

function confirmDeleteItem(doc) {
  if (
    confirm(
      `Вы уверены, что хотите удалить документ "${
        doc.name || "Без названия"
      }" (№${doc.document_number || "б/н"})?`
    )
  ) {
    deleteDocument(doc);
  }
}

function deleteDocument(docToDelete) {
  documents.value = documents.value.filter(
    (d) => d.iddocument !== docToDelete.iddocument
  );
  initialDataLoaded.value = false;
}
</script>

<style scoped>
.th-cell {
  @apply px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider;
}
.td-cell {
  @apply px-6 py-4 border-b border-gray-200 text-sm;
}
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center;
}
.btn-icon-text {
  @apply flex items-center space-x-1 transition-colors duration-200;
}
</style>
