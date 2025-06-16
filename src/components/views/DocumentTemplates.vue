<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Шаблоны документов</h1>
      <button @click="openModal()" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить шаблон</span>
      </button>
    </div>

    <!-- Поиск -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по названию или типу..."
        class="input-field w-full md:w-1/2 lg:w-1/3"
      />
    </div>

    <div v-if="loading" class="space-y-4">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-white rounded-lg shadow p-4 h-24 animate-pulse"
      ></div>
    </div>
    <div
      v-else-if="filteredTemplates.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="templates.length === 0">Нет шаблонов для отображения.</p>
      <p v-else>Шаблоны по вашему запросу не найдены.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="bg-white rounded-lg shadow-md p-4 flex justify-between items-center transition-shadow hover:shadow-lg"
      >
        <div>
          <h3 class="font-semibold text-lg text-primary-700 mb-1">
            {{ template.name }}
          </h3>
          <div class="flex items-center text-sm text-gray-500">
            <span
              class="font-mono bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs mr-2"
              >{{ template.type }}</span
            >
            <span v-if="template.prefix"
              >Префикс: <strong>{{ template.prefix }}</strong></span
            >
          </div>
        </div>
        <div class="flex space-x-2 shrink-0 ml-4">
          <button
            @click="openModal(template)"
            class="btn-icon-text text-primary-600 hover:text-primary-800"
          >
            <span class="material-symbols-outlined text-lg">edit</span>
            <span class="text-sm hidden sm:inline">Изменить</span>
          </button>
          <button
            @click="confirmDelete(template.id)"
            class="btn-icon-text text-red-500 hover:text-red-700"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
            <span class="text-sm hidden sm:inline">Удалить</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Create/Edit -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-start justify-center p-4 sm:pt-10 z-50"
    >
      <div
        class="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-6xl mx-auto"
        @click.stop
      >
        <h2 class="text-2xl font-bold mb-6">
          {{ isEditing ? "Редактировать шаблон" : "Создать шаблон" }}
        </h2>
        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div class="md:col-span-1">
              <label class="label-form">Название шаблона</label>
              <input
                v-model="form.name"
                placeholder="Напр. Договор на оказание услуг"
                required
                class="input-field"
              />
            </div>
            <div class="md:col-span-1">
              <label class="label-form">Префикс номера</label>
              <input
                v-model="form.prefix"
                placeholder="Напр. ДК-"
                class="input-field"
              />
            </div>
            <div class="md:col-span-1">
              <label class="label-form">Тип документа</label>
              <select v-model="form.type" required class="input-field">
                <option value="CONTRACT">Договор</option>
                <option value="ACT">Акт</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>
          </div>
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700"
                >Содержимое шаблона</label
              >
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-700 mr-3"
                  >Режим HTML</span
                >
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="isHtmlMode"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
                  ></div>
                </label>
              </div>
            </div>

            <div v-if="!isHtmlMode" class="quill-container">
              <QuillEditor
                ref="quillEditorRef"
                theme="snow"
                :toolbar="editorToolbar"
                v-model:content="form.content"
                contentType="html"
                style="min-height: 400px; display: flex; flex-direction: column"
              />
            </div>
            <textarea
              v-else
              v-model="form.content"
              class="input-field font-mono text-sm w-full"
              rows="16"
              placeholder="Введите HTML-код вашего шаблона..."
            ></textarea>

            <div class="mt-2 text-xs text-gray-500">
              <p>
                Используйте плейсхолдеры для авто-подстановки:
                <code>{{ eventName }}</code
                >, <code>{{ customerName }}</code
                >, <code>{{ eventCost }}</code> и др.
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-4">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import apiService from "@/services/api.service.js";
import { useAuthStore } from "@/store/auth.store";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

const searchQuery = ref("");
const authStore = useAuthStore();

const filteredTemplates = computed(() => {
  if (!searchQuery.value) {
    return templates.value;
  }
  const lowerQuery = searchQuery.value.toLowerCase();
  return templates.value.filter(
    (template) =>
      (template.name || "").toLowerCase().includes(lowerQuery) ||
      (template.type || "").toLowerCase().includes(lowerQuery)
  );
});

const screenWidth = ref(window.innerWidth);

const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  fetchTemplates();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const editorToolbar = computed(() => {
  if (screenWidth.value < 768) {
    // md breakpoint in Tailwind
    return [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ];
  }
  return "full";
});

const templates = ref([]);
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isHtmlMode = ref(false);
const quillEditorRef = ref(null);
const form = ref({
  id: null,
  name: "",
  type: "CONTRACT",
  prefix: "",
  content: "",
});

watch([isModalOpen, isHtmlMode], async ([newModalOpen, newHtmlMode]) => {
  if (newModalOpen && !newHtmlMode) {
    await nextTick();
    if (quillEditorRef.value) {
      quillEditorRef.value.setHTML(form.value.content || "");
    }
  }
});

const fetchTemplates = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiService.getDocumentTemplates();
    templates.value = response.data.data;
  } catch (err) {
    console.error("Failed to fetch templates:", err);
    error.value = "Не удалось загрузить шаблоны.";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    id: null,
    name: "",
    type: "CONTRACT",
    prefix: "",
    content: "",
  };
};

const openModal = async (template = null) => {
  resetForm();
  isHtmlMode.value = false;
  if (template) {
    isEditing.value = true;
    try {
      const res = await apiService.getDocumentTemplate(template.id);
      if (res.success) {
        form.value = res.data;
      }
    } catch (err) {
      error.value = "Не удалось загрузить данные шаблона.";
    }
  } else {
    isEditing.value = false;
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  try {
    const response = isEditing.value
      ? await apiService.updateDocumentTemplate(form.value.id, form.value)
      : await apiService.createDocumentTemplate(form.value);
    if (response.data.success) {
      closeModal();
      fetchTemplates();
    } else {
      throw new Error(response.data.message || "Failed to save template");
    }
  } catch (err) {
    console.error(err);
    alert(`Error saving template: ${err.message}`);
  }
};

const confirmDelete = async (id) => {
  if (confirm("Вы уверены, что хотите удалить этот шаблон?")) {
    try {
      const response = await apiService.deleteDocumentTemplate(id);
      if (response.data.success) {
        fetchTemplates();
      } else {
        throw new Error(response.data.message || "Failed to delete template");
      }
    } catch (err) {
      console.error(err);
      alert(`Error deleting template: ${err.message}`);
    }
  }
};
</script>

<style>
/* Стили для того, чтобы редактор занимал все доступное пространство */
.ql-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.ql-editor {
  height: 100%;
  flex-grow: 1;
  overflow-y: auto;
}
</style>

<style scoped>
.table-header {
  @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider;
}
.table-cell {
  @apply px-5 py-4 border-b border-gray-200 bg-white text-sm;
}
.quill-container {
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.375rem; /* rounded-md */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px; /* or any height you prefer */
}

/* Make modal wider */
.max-w-6xl {
  max-width: 80rem; /* You can adjust this value */
}
</style>
