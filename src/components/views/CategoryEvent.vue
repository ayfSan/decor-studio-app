<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Категории мероприятий</h1>
      <button @click="openAddModal" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить категорию</span>
      </button>
    </div>

    <!-- Поиск -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по названию категории..."
        class="input-field w-full md:w-1/2 lg:w-1/3"
      />
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div
        v-for="n in 5"
        :key="n"
        class="bg-white rounded-lg shadow p-4 h-20 animate-pulse"
      ></div>
    </div>
    <div
      v-else-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="categories.length === 0">Нет категорий для отображения.</p>
      <p v-else>Категории по вашему запросу не найдены.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in paginatedItems"
        :key="item.idcategory_event"
        class="bg-white rounded-lg shadow p-4 flex justify-between items-center"
      >
        <div>
          <h3 class="font-semibold text-lg text-primary-700 mb-1">
            {{ item.name || "Категория без названия" }}
          </h3>
          <p class="text-sm text-gray-500">ID: {{ item.idcategory_event }}</p>
        </div>
        <div class="flex space-x-3 shrink-0 ml-4">
          <button
            @click="openEditModal(item)"
            class="btn-icon-text text-primary-600 hover:text-primary-800"
          >
            <span class="material-symbols-outlined text-lg">edit</span>
            <span class="text-sm hidden sm:inline">Изменить</span>
          </button>
          <button
            @click="confirmDeleteItem(item)"
            class="btn-icon-text text-red-500 hover:text-red-700"
          >
            <span class="material-symbols-outlined text-lg">delete</span>
            <span class="text-sm hidden sm:inline">Удалить</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="totalPages > 1"
      class="mt-8 flex justify-center items-center space-x-2 flex-wrap"
    >
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        Назад
      </button>
      <template v-for="pageNumber in displayedPages" :key="pageNumber">
        <button
          v-if="pageNumber === '...'"
          disabled
          class="pagination-btn-disabled"
        >
          ...
        </button>
        <button
          v-else
          @click="goToPage(pageNumber)"
          :class="[
            'pagination-btn',
            currentPage === pageNumber ? 'pagination-btn-active' : '',
          ]"
        >
          {{ pageNumber }}
        </button>
      </template>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Вперед
      </button>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditMode ? "Редактировать категорию" : "Добавить категорию" }}
        </h2>
        <form @submit.prevent="saveCategory">
          <div>
            <label for="name" class="label-form">Название категории</label>
            <input
              type="text"
              id="name"
              v-model="currentCategory.name"
              required
              class="input-field"
            />
          </div>
          <div class="mt-8 flex justify-end space-x-3">
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
import { ref, onMounted, computed, watch } from "vue";
import apiService from "@/services/api.service";
import { useAuthStore } from "@/store/auth.store";
import NProgress from "nprogress";
import usePagination from "@/composables/usePagination";

const categories = ref([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentCategory = ref({});
const searchQuery = ref("");
const authStore = useAuthStore();

const defaultCategory = { name: "" };

async function loadCategories() {
  isLoading.value = true;
  NProgress.start();
  try {
    const response = await apiService.getEventCategories();
    if (response.data.success) {
      categories.value = response.data.data;
    }
  } catch (error) {
    console.error("Failed to load event categories:", error);
  } finally {
    isLoading.value = false;
    NProgress.done();
  }
}

onMounted(() => {
  loadCategories();
});

const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return categories.value;
  }
  const lowerQuery = searchQuery.value.toLowerCase();
  return categories.value.filter((item) =>
    (item.name || "").toLowerCase().includes(lowerQuery)
  );
});

const {
  paginatedItems,
  totalPages,
  currentPage,
  displayedPages,
  nextPage,
  prevPage,
  goToPage,
} = usePagination(filteredItems, { itemsPerPage: 9 });

function openAddModal() {
  isEditMode.value = false;
  currentCategory.value = { ...defaultCategory };
  isModalOpen.value = true;
}

function openEditModal(category) {
  isEditMode.value = true;
  currentCategory.value = { ...category };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function saveCategory() {
  NProgress.start();
  try {
    let response;
    if (isEditMode.value) {
      response = await apiService.updateEventCategory(
        currentCategory.value.idcategory_event,
        { name: currentCategory.value.name }
      );
    } else {
      response = await apiService.createEventCategory({
        name: currentCategory.value.name,
      });
    }
    if (response.data.success) {
      await loadCategories();
      closeModal();
    } else {
      throw new Error(
        response.data.message || "Не удалось сохранить категорию"
      );
    }
  } catch (error) {
    console.error("Failed to save category:", error);
    alert(`Ошибка сохранения категории: ${error.message}`);
  } finally {
    NProgress.done();
  }
}

async function confirmDeleteItem(categoryToDelete) {
  if (
    confirm(
      `Вы уверены, что хотите удалить категорию "${categoryToDelete.name}"?`
    )
  ) {
    NProgress.start();
    try {
      const response = await apiService.deleteEventCategory(
        categoryToDelete.idcategory_event
      );
      if (response.data.success) {
        await loadCategories();
      } else {
        throw new Error(
          response.data.message || "Не удалось удалить категорию"
        );
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert(
        "Ошибка удаления категории. Возможно, она используется в мероприятиях."
      );
    } finally {
      NProgress.done();
    }
  }
}

watch(searchQuery, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
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
.modal-overlay {
  @apply fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4;
}
.modal-content {
  @apply bg-white p-8 rounded-lg shadow-xl w-full max-w-md;
}
.pagination-btn {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0;
}
.pagination-btn-active {
  @apply bg-primary-600 text-white border-primary-600;
}
.pagination-btn-disabled {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 mb-2 sm:mb-0;
}
</style>
