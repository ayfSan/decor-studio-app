<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Места проведения</h1>
      <button @click="openAddModal" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить место</span>
      </button>
    </div>

    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск по названию, адресу..."
        class="input-field w-full md:w-1/2 lg:w-1/3"
      />
    </div>

    <div
      v-if="isLoading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="bg-white rounded-lg shadow-md h-64 animate-pulse"
      ></div>
    </div>
    <div
      v-else-if="paginatedItems.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p v-if="venues.length === 0">
        Нет мест для отображения. Нажмите "Добавить", чтобы создать новое место.
      </p>
      <p v-else>Места по вашему запросу не найдены.</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="venue in paginatedItems"
          :key="venue.idvenue"
          class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          <div class="p-4 bg-primary-50">
            <h3 class="font-semibold text-lg text-primary-700">
              {{ venue.name_venue || "Место без названия" }}
            </h3>
          </div>
          <div class="p-4 space-y-2 flex-grow">
            <p v-if="venue.address" class="text-sm">
              <strong class="font-medium">Адрес:</strong> {{ venue.address }}
            </p>
            <p v-if="venue.contact_person" class="text-sm">
              <strong class="font-medium">Конт. лицо:</strong>
              {{ venue.contact_person }}
            </p>
            <p v-if="venue.phone" class="text-sm">
              <strong class="font-medium">Телефон:</strong> {{ venue.phone }}
            </p>
            <p
              v-if="venue.notes"
              class="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-100"
            >
              <strong class="font-medium">Примечания:</strong><br />{{
                venue.notes
              }}
            </p>
          </div>
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <div class="flex justify-end space-x-3">
              <button
                @click="openEditModal(venue)"
                class="btn-icon-text text-primary-600 hover:text-primary-800"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
                <span class="text-sm">Изменить</span>
              </button>
              <button
                @click="confirmDeleteItem(venue)"
                class="btn-icon-text text-red-500 hover:text-red-700"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
                <span class="text-sm">Удалить</span>
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
    </div>

    <!-- Modal for Add/Edit -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6">
          {{ isEditMode ? "Редактировать место" : "Добавить место" }}
        </h2>
        <form
          @submit.prevent="saveVenue"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label for="name_venue" class="label-form">Название</label>
            <input
              type="text"
              id="name_venue"
              v-model="currentVenue.name_venue"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="address" class="label-form">Адрес</label>
            <input
              type="text"
              id="address"
              v-model="currentVenue.address"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="contact_person" class="label-form"
              >Контактное лицо</label
            >
            <input
              type="text"
              id="contact_person"
              v-model="currentVenue.contact_person"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="phone" class="label-form">Телефон</label>
            <input
              type="tel"
              id="phone"
              v-model="currentVenue.phone"
              required
              class="input-field"
            />
          </div>
          <div class="md:col-span-2">
            <label for="notes" class="label-form">Примечания</label>
            <textarea
              id="notes"
              v-model="currentVenue.notes"
              rows="3"
              class="input-field"
            ></textarea>
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
import usePagination from "@/composables/usePagination";

const venues = ref([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const currentVenue = ref({});
const isEditMode = ref(false);
const searchQuery = ref("");
const authStore = useAuthStore();

const defaultVenue = {
  name_venue: "",
  address: "",
  contact_person: "",
  phone: "",
  notes: "",
};

async function loadVenues() {
  isLoading.value = true;
  try {
    const response = await apiService.getVenues();
    venues.value = response.data.data;
  } catch (error) {
    console.error("Error loading venues:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadVenues();
});

const filteredVenues = computed(() => {
  if (!searchQuery.value) {
    return venues.value;
  }
  const lowerQuery = searchQuery.value.toLowerCase();
  return venues.value.filter(
    (item) =>
      (item.name_venue || "").toLowerCase().includes(lowerQuery) ||
      (item.address || "").toLowerCase().includes(lowerQuery)
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
} = usePagination(filteredVenues, { itemsPerPage: 6 });

function openAddModal() {
  isEditMode.value = false;
  currentVenue.value = { ...defaultVenue };
  isModalOpen.value = true;
}

function openEditModal(venue) {
  isEditMode.value = true;
  currentVenue.value = { ...venue };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function saveVenue() {
  try {
    let response;
    if (isEditMode.value) {
      response = await apiService.updateVenue(
        currentVenue.value.idvenue,
        currentVenue.value
      );
    } else {
      response = await apiService.createVenue(currentVenue.value);
    }

    if (response.data.success) {
      closeModal();
      loadVenues();
    } else {
      alert(
        `Ошибка: ${
          response.data.message || "Не удалось сохранить место проведения."
        }`
      );
    }
  } catch (error) {
    console.error("Error saving venue:", error);
    alert("Произошла критическая ошибка при сохранении.");
  }
}

async function confirmDeleteItem(venue) {
  if (confirm(`Вы уверены, что хотите удалить место "${venue.name_venue}"?`)) {
    await deleteItem(venue.idvenue);
  }
}

async function deleteItem(id) {
  try {
    const response = await apiService.deleteVenue(id);
    if (response.data.success) {
      loadVenues();
    } else {
      alert(
        `Ошибка удаления: ${
          response.data.message || "Не удалось удалить место проведения."
        }`
      );
    }
  } catch (error) {
    console.error("Error deleting venue:", error);
    alert("Произошла критическая ошибка при удалении.");
  }
}

watch(searchQuery, () => {
  currentPage.value = 1;
});
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
