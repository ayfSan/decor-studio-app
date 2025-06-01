<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Счета ДС</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить счет</span>
      </button>
    </div>

    <!-- Поиск -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по названию счета..."
        class="input-field w-full md:w-1/2 lg:w-1/3"
      />
    </div>

    <div
      v-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="accounts.length === 0">Нет счетов для отображения.</p>
      <p v-else>Счета по вашему запросу не найдены.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in paginatedItems"
        :key="item.idaccount_cashflow"
        class="bg-white rounded-lg shadow p-4 flex justify-between items-center"
      >
        <div>
          <h3 class="font-semibold text-lg text-primary-700 mb-1">
            {{ item.name || "Счет без названия" }}
          </h3>
          <p class="text-sm text-gray-500">ID: {{ item.idaccount_cashflow }}</p>
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
          {{ isEditMode ? "Редактировать счет" : "Добавить счет" }}
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

const accounts = ref([
  { idaccount_cashflow: 1, name: "Наличные RUB" },
  { idaccount_cashflow: 2, name: "Карта Сбербанк" },
  { idaccount_cashflow: 3, name: 'Расчетный счет ООО "Ромашка"' },
  { idaccount_cashflow: 4, name: "Касса #1" },
  { idaccount_cashflow: 5, name: "Тинькофф Бизнес" },
  { idaccount_cashflow: 6, name: "ЮMoney Кошелек" },
  { idaccount_cashflow: 7, name: "ВТБ Онлайн" },
  { idaccount_cashflow: 8, name: "Альфа-Банк Корп." },
  { idaccount_cashflow: 9, name: "Резервный фонд" },
  { idaccount_cashflow: 10, name: "Сейф в офисе" },
  { idaccount_cashflow: 11, name: "Счет для командировок" },
]);

const searchQuery = ref("");
const isModalOpen = ref(false);
const currentItem = ref({});
const isEditMode = ref(false);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(9); // Display 9 items per page (3x3 grid on large screens)

const filteredAccounts = computed(() => {
  if (!searchQuery.value) {
    return accounts.value;
  }
  const lowerSearchQuery = searchQuery.value.toLowerCase();
  return accounts.value.filter((account) =>
    (account.name || "").toLowerCase().includes(lowerSearchQuery)
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredAccounts.value.length / itemsPerPage.value);
});

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredAccounts.value.slice(startIndex, endIndex);
});

watch(searchQuery, () => {
  currentPage.value = 1; // Сбрасываем на первую страницу при поиске
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
  if (pageNumber !== "...") {
    currentPage.value = pageNumber;
  }
}

// Computed property for displayed page numbers (with ellipses)
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 1; // Number of pages to show around the current page
  const range = [];
  const rangeWithDots = [];
  let l;

  if (total <= 1) {
    return []; // No pagination needed for 1 or 0 pages
  }

  range.push(1);
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }
  if (total > 1) {
    // Always add last page if more than 1 page
    range.push(total);
  }

  // Deduplicate and sort, as current page might be 1 or total
  const uniqueSortedRange = [...new Set(range)].sort((a, b) => a - b);

  uniqueSortedRange.forEach((i) => {
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
    const index = accounts.value.findIndex(
      (i) => i.idaccount_cashflow === currentItem.value.idaccount_cashflow
    );
    if (index !== -1) {
      accounts.value[index] = { ...currentItem.value };
    }
  } else {
    // Simulate ID generation for new items
    currentItem.value.idaccount_cashflow =
      accounts.value.length > 0
        ? Math.max(...accounts.value.map((i) => i.idaccount_cashflow)) + 1
        : 1;
    accounts.value.push({ ...currentItem.value });
    // After adding, if the new item is on a new page, go to that page
    if (accounts.value.length > totalPages.value * itemsPerPage.value) {
      currentPage.value = totalPages.value;
    } else if (
      accounts.value.length > (currentPage.value - 1) * itemsPerPage.value &&
      accounts.value.length <= currentPage.value * itemsPerPage.value &&
      paginatedItems.value.length < itemsPerPage.value
    ) {
      // If it fits on current page, do nothing, it will appear
    } else {
      // If it makes the current page full and there are more items, it might push to a new page.
      // Or if current page was empty, stay on it.
      // Recalculate totalPages and adjust if current page is now out of bounds
      const newTotalPages = Math.ceil(
        accounts.value.length / itemsPerPage.value
      );
      if (currentPage.value > newTotalPages) currentPage.value = newTotalPages;
      // If it was the first item, stay on page 1 or go to the page it's on
      if (accounts.value.length <= itemsPerPage.value) currentPage.value = 1;
      else if (paginatedItems.value.length === 0)
        currentPage.value = newTotalPages;
    }
  }
  closeModal();
}

function confirmDeleteItem(itemToDelete) {
  if (confirm(`Вы уверены, что хотите удалить счет "${itemToDelete.name}"?`)) {
    deleteItem(itemToDelete);
    // After deleting, if current page becomes empty and it's not the first page, go to previous page
    if (paginatedItems.value.length === 0 && currentPage.value > 1) {
      prevPage();
    }
  }
}

function deleteItem(itemToDelete) {
  accounts.value = accounts.value.filter(
    (i) => i.idaccount_cashflow !== itemToDelete.idaccount_cashflow
  );
  // After deleting, if current page is now beyond the total pages, adjust
  const newTotalPages = Math.ceil(accounts.value.length / itemsPerPage.value);
  if (currentPage.value > newTotalPages && newTotalPages > 0) {
    currentPage.value = newTotalPages;
  }
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
