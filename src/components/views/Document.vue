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

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-cell">ID</th>
            <th class="th-cell">Событие</th>
            <th class="th-cell">Наименование</th>
            <th class="th-cell">Номер</th>
            <th class="th-cell">Дата</th>
            <th class="th-cell">Тип</th>
            <th class="th-cell">Файл</th>
            <th class="th-cell">Действия</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="documents.length === 0">
            <td colspan="8" class="td-cell text-center">
              Нет данных для отображения
            </td>
          </tr>
          <tr
            v-for="doc in documents"
            :key="doc.iddocument"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ doc.iddocument }}</td>
            <td class="td-cell">{{ getEventNameById(doc.event_idevent) }}</td>
            <td class="td-cell">{{ doc.name }}</td>
            <td class="td-cell">{{ doc.document_number }}</td>
            <td class="td-cell">{{ formatDate(doc.date) }}</td>
            <td class="td-cell">{{ doc.type }}</td>
            <td class="td-cell">
              <a
                v-if="doc.file_path"
                :href="doc.file_path"
                target="_blank"
                class="text-primary-600 hover:underline"
                >Просмотреть</a
              >
              <span v-else>-</span>
            </td>
            <td class="td-cell">
              <button
                @click="openEditModal(doc)"
                class="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                @click="confirmDeleteItem(doc)"
                class="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for Add/Edit -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6">
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
import { ref, computed } from "vue";

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
]);

// Demo data for events (ideally fetched or passed as prop)
const eventsList = ref([
  { idevent: 101, project_name: "Свадьба Анны и Петра" },
  { idevent: 102, project_name: 'Юбилей компании "ТехноПрорыв"' },
  { idevent: 103, project_name: "Конференция Разработчиков" },
]);

const isModalOpen = ref(false);
const currentDocument = ref({});
const isEditMode = ref(false);

const defaultDocument = {
  event_idevent: null,
  name: "",
  document_number: "",
  date: new Date().toISOString().slice(0, 10),
  type: "OTHER",
  file_path: "",
};

// Helper to get event name by ID
const getEventNameById = (eventId) => {
  const event = eventsList.value.find((e) => e.idevent === eventId);
  return event ? event.project_name : "Неизвестное событие";
};

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  // Adjust for timezone to display the correct date as selected by the user
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
  currentDocument.value = { ...doc }; // Date is already in YYYY-MM-DD for date input
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
    documents.value.push({ ...currentDocument.value, iddocument: Date.now() }); // Replace with actual ID
  }
  closeModal();
}

function confirmDeleteItem(doc) {
  if (
    confirm(
      `Вы уверены, что хотите удалить документ "${doc.name}" (№${doc.document_number})?`
    )
  ) {
    deleteDocument(doc);
  }
}

function deleteDocument(docToDelete) {
  documents.value = documents.value.filter(
    (d) => d.iddocument !== docToDelete.iddocument
  );
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
  @apply px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm;
}
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm;
}
</style>
