<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Категории ДС</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
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

    <div
      v-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="categories.length === 0">Нет категорий для отображения.</p>
      <p v-else>
        Категории по вашему запросу не найдены или нет данных на этой странице.
      </p>
    </div>
    <div v-else>
      <div class="space-y-4">
        <div
          v-for="item in paginatedItems"
          :key="item.idcategory_cashflow"
          class="bg-white rounded-lg shadow p-4 flex justify-between items-center"
        >
          <div>
            <h3 class="font-semibold text-lg text-primary-700 mb-1">
              {{ item.name || "Категория без названия" }}
            </h3>
            <p class="text-sm text-gray-500">
              ID: {{ item.idcategory_cashflow }}
            </p>
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
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="totalPages > 1"
      class="mt-8 flex justify-center items-center space-x-2 flex-wrap"
    >
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0"
      >
        Назад
      </button>

      <template v-for="pageNumber in displayedPages" :key="pageNumber">
        <button
          v-if="pageNumber === '...'"
          disabled
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 mb-2 sm:mb-0"
        >
          ...
        </button>
        <button
          v-else
          @click="goToPage(pageNumber)"
          :class="[
            'px-4 py-2 text-sm font-medium border rounded-lg mb-2 sm:mb-0',
            currentPage === pageNumber
              ? 'bg-primary-600 text-white border-primary-600'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-100',
          ]"
        >
          {{ pageNumber }}
        </button>
      </template>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mb-2 sm:mb-0"
      >
        Вперед
      </button>
    </div>

    <!-- Modal for Add/Edit -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditMode ? "Редактировать категорию" : "Добавить категорию" }}
        </h2>
        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label for="itemName" class="label-form">Наименование</label>
            <input
              type="text"
              id="itemName"
              v-model="currentItem.name"
              required
              class="input-field"
            />
          </div>
          <div class="mt-6 flex justify-end space-x-3">
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
import { ref, computed, watch } from "vue";

const categories = ref([
  { idcategory_cashflow: 1, name: "Аренда оборудования" },
  { idcategory_cashflow: 2, name: "Транспортные расходы" },
  { idcategory_cashflow: 3, name: "Оплата подрядчикам" },
  { idcategory_cashflow: 4, name: "Материалы" },
]);

const searchQuery = ref("");
const isModalOpen = ref(false);
const currentItem = ref({});
const isEditMode = ref(false);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(9);

const filteredCategories = computed(() => {
  if (!searchQuery.value) {
    return categories.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return categories.value.filter((category) =>
    (category.name || "").toLowerCase().includes(lowerSearchQuery)
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredCategories.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredCategories.value.slice(startIndex, endIndex);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

// Pagination methods
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function goToPage(pageNumber) {
  currentPage.value = pageNumber;
}

// Computed property for displayed page numbers (with ellipses)
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);
  if (total <= 1) {
    return range;
  }

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }
  range.push(total);

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  });

  return rangeWithDots;
});

function openAddModal() {
  isEditMode.value = false;
  currentItem.value = { name: "" };
  isModalOpen.value = true;
}

function openEditModal(item) {
  isEditMode.value = true;
  currentItem.value = { ...item };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveItem() {
  if (isEditMode.value) {
    const index = categories.value.findIndex(
      (i) => i.idcategory_cashflow === currentItem.value.idcategory_cashflow
    );
    if (index !== -1) {
      categories.value[index] = { ...currentItem.value };
    }
  } else {
    // Simulate ID generation for new items
    currentItem.value.idcategory_cashflow =
      categories.value.length > 0
        ? Math.max(...categories.value.map((i) => i.idcategory_cashflow)) + 1
        : 1;
    categories.value.push({ ...currentItem.value });
  }
  closeModal();
}

function confirmDeleteItem(itemToDelete) {
  if (
    confirm(`Вы уверены, что хотите удалить категорию "${itemToDelete.name}"?`)
  ) {
    deleteItem(itemToDelete);
    if (paginatedItems.value.length === 0 && currentPage.value > 1) {
      prevPage();
    }
  }
}

function deleteItem(itemToDelete) {
  categories.value = categories.value.filter(
    (i) => i.idcategory_cashflow !== itemToDelete.idcategory_cashflow
  );
}
</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
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
