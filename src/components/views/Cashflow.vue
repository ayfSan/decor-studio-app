<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Движение ДС</h1>
      <button @click="openAddModal" class="btn-primary flex items-center">
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить операцию</span>
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10 text-gray-500">
      Загрузка операций...
    </div>
    <div
      v-else-if="Object.keys(groupedCashflowItems).length === 0"
      class="text-center py-10 text-gray-500"
    >
      <p>Нет данных для отображения.</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="(group, eventIdKey) in groupedCashflowItems"
        :key="eventIdKey"
        class="bg-white rounded-lg shadow-md"
      >
        <h2
          @click="toggleGroup(eventIdKey)"
          class="text-xl font-semibold text-gray-700 p-4 border-b cursor-pointer flex justify-between items-center select-none hover:bg-gray-50"
        >
          {{ group.name }}
          <span
            class="material-symbols-outlined text-gray-500 transform transition-transform"
            :class="{ 'rotate-180': isGroupExpanded(eventIdKey) }"
            >expand_more</span
          >
        </h2>
        <div v-if="isGroupExpanded(eventIdKey)" class="p-4 space-y-4">
          <div
            v-if="group.items.length === 0"
            class="text-sm text-gray-500 italic"
          >
            Нет операций для этого элемента.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="item in group.items"
              :key="item.idcashflow"
              class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
            >
              <div
                class="p-4 flex justify-between items-start"
                :class="{
                  'bg-green-50': item.income > 0,
                  'bg-red-50': item.expense > 0,
                  'bg-gray-50': !item.income && !item.expense,
                }"
              >
                <div>
                  <h3
                    class="font-semibold text-lg"
                    :class="{
                      'text-green-700': item.income > 0,
                      'text-red-700': item.expense > 0,
                      'text-gray-700': !item.income && !item.expense,
                    }"
                  >
                    {{ item.transaction || "Операция" }}
                  </h3>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ formatDate(item.date) }}
                  </p>
                </div>
                <div class="text-right flex-shrink-0 ml-4">
                  <p
                    v-if="item.income > 0"
                    class="text-xl font-bold text-green-600"
                  >
                    +{{ formatCurrency(item.income) }}
                  </p>
                  <p
                    v-if="item.expense > 0"
                    class="text-xl font-bold text-red-600"
                  >
                    -{{ formatCurrency(item.expense) }}
                  </p>
                </div>
              </div>
              <div class="p-4 space-y-3 flex-grow">
                <p class="text-sm">
                  <strong class="font-medium">Счет:</strong>
                  {{ getAccountName(item.account_cashflow_idaccount_cashflow) }}
                </p>
                <p class="text-sm">
                  <strong class="font-medium">Категория:</strong>
                  {{
                    getCategoryName(item.category_cashflow_idcategory_cashflow)
                  }}
                </p>
                <p v-if="item.note" class="text-sm">
                  <strong class="font-medium">Примечание:</strong>
                  {{ item.note }}
                </p>
              </div>
              <div class="p-4 border-t border-gray-200 bg-gray-50">
                <div class="flex justify-end space-x-3">
                  <button
                    @click="openEditModal(item)"
                    class="btn-icon-text text-primary-600 hover:text-primary-800"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                    <span class="text-sm">Изменить</span>
                  </button>
                  <button
                    @click="confirmDeleteItem(item.idcashflow)"
                    class="btn-icon-text text-red-500 hover:text-red-700"
                  >
                    <span class="material-symbols-outlined text-lg"
                      >delete</span
                    >
                    <span class="text-sm">Удалить</span>
                  </button>
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
      class="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">
          {{ isEditMode ? "Редактировать операцию" : "Добавить операцию" }}
        </h2>
        <form
          @submit.prevent="saveItem"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label for="date" class="label-form">Дата</label>
            <input
              type="datetime-local"
              id="date"
              v-model="currentItem.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="transaction" class="label-form">Описание</label>
            <input
              type="text"
              id="transaction"
              v-model="currentItem.transaction"
              class="input-field"
              placeholder="Например, предоплата"
            />
          </div>
          <div>
            <label for="account" class="label-form">Счет</label>
            <select
              id="account"
              v-model.number="currentItem.account_cashflow_idaccount_cashflow"
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите счет</option>
              <option
                v-for="acc in accounts"
                :key="acc.idaccount_cashflow"
                :value="acc.idaccount_cashflow"
              >
                {{ acc.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="category" class="label-form">Категория</label>
            <select
              id="category"
              v-model.number="currentItem.category_cashflow_idcategory_cashflow"
              required
              class="input-field"
            >
              <option :value="null" disabled>Выберите категорию</option>
              <option
                v-for="cat in categories"
                :key="cat.idcategory_cashflow"
                :value="cat.idcategory_cashflow"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="income" class="label-form">Приход</label>
            <input
              type="number"
              step="0.01"
              id="income"
              v-model.number="currentItem.income"
              class="input-field"
            />
          </div>
          <div>
            <label for="expense" class="label-form">Расход</label>
            <input
              type="number"
              step="0.01"
              id="expense"
              v-model.number="currentItem.expense"
              class="input-field"
            />
          </div>
          <div class="md:col-span-2">
            <label for="event" class="label-form">Событие (опционально)</label>
            <select
              id="event"
              v-model.number="currentItem.event_idevent"
              class="input-field"
            >
              <option :value="null">Без привязки к событию</option>
              <option
                v-for="ev in eventsList"
                :key="ev.idevent"
                :value="ev.idevent"
              >
                {{ ev.project_name }}
              </option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="note" class="label-form">Примечание</label>
            <textarea
              id="note"
              v-model="currentItem.note"
              rows="2"
              class="input-field"
            ></textarea>
          </div>
          <div class="md:col-span-2 mt-4 flex justify-end space-x-4">
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
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useAuthStore } from "@/store/auth.store";
import NProgress from "nprogress";

// Main data stores
const cashflowItems = ref([]);
const accounts = ref([]);
const categories = ref([]);
const eventsList = ref([]);
const isLoading = ref(true);

// Modal state
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentItem = ref({});

// Accordion state
const expandedGroups = ref({});
const authStore = useAuthStore();

onMounted(() => {
  loadInitialData();
});

async function loadInitialData() {
  isLoading.value = true;
  try {
    const [cashflowRes, accountsRes, categoriesRes, eventsRes] =
      await Promise.all([
        apiService.getCashflow(),
        apiService.getCashflowAccounts(),
        apiService.getCashflowCategories(),
        apiService.getEvents(),
      ]);
    cashflowItems.value = cashflowRes.data.data;
    accounts.value = accountsRes.data.data;
    categories.value = categoriesRes.data.data;
    eventsList.value = eventsRes.data.data;
  } catch (error) {
    console.error("Failed to load cashflow data:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- DATA COMPUTATION AND HELPERS ---
const getAccountName = (id) => {
  const account = accounts.value.find((a) => a.idaccount_cashflow === id);
  return account ? account.name : "N/A";
};
const getCategoryName = (id) =>
  categories.value.find((c) => c.idcategory_cashflow === id)?.name || "N/A";
const getEventName = (id) =>
  eventsList.value.find((e) => e.idevent === id)?.project_name ||
  "Без мероприятия";

const groupedCashflowItems = computed(() => {
  const groups = {};

  // Group by event
  cashflowItems.value.forEach((item) => {
    const eventId = item.event_idevent;
    if (!groups[eventId]) {
      groups[eventId] = {
        name:
          eventId === null
            ? "Операции без привязки к событию"
            : getEventName(eventId),
        items: [],
      };
    }
    groups[eventId].items.push(item);
  });

  // Sort groups: events first, then "no event"
  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (a.id === null) return 1; // "No event" group to the end
    if (b.id === null) return -1;
    // You might want to sort events by date or name
    const eventA = eventsList.value.find((e) => e.idevent === a.id);
    const eventB = eventsList.value.find((e) => e.idevent === b.id);
    if (eventA && eventB) {
      return new Date(eventB.date) - new Date(eventA.date); // Sort by most recent event date
    }
    return 0;
  });

  return sortedGroups;
});

const toggleGroup = (groupId) => {
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};
const isGroupExpanded = (groupId) => expandedGroups.value[groupId] === true;

// --- MODAL AND CRUD LOGIC ---
const openAddModal = () => {
  isEditMode.value = false;
  currentItem.value = {
    date: new Date().toISOString().slice(0, 16),
    income: 0,
    expense: 0,
    account_cashflow_idaccount_cashflow: null,
    category_cashflow_idcategory_cashflow: null,
    event_idevent: null,
  };
  isModalOpen.value = true;
};

const openEditModal = (item) => {
  isEditMode.value = true;
  currentItem.value = {
    ...item,
    date: item.date ? new Date(item.date).toISOString().slice(0, 16) : null,
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  currentItem.value = {};
};

const saveItem = async () => {
  NProgress.start();
  try {
    const dataToSave = {
      ...currentItem.value,
      income: currentItem.value.income || 0,
      expense: currentItem.value.expense || 0,
    };

    let response;
    if (isEditMode.value) {
      response = await apiService.updateCashflow(
        currentItem.value.idcashflow,
        dataToSave
      );
    } else {
      response = await apiService.createCashflow(dataToSave);
    }

    if (response.data.success) {
      closeModal();
      await loadInitialData();
    } else {
      alert(
        `Ошибка: ${response.data.message || "Не удалось сохранить операцию."}`
      );
    }
  } catch (error) {
    console.error("Error saving cashflow item:", error);
    alert("Произошла критическая ошибка при сохранении.");
  } finally {
    NProgress.done();
  }
};

const confirmDeleteItem = async (id) => {
  if (confirm("Вы уверены, что хотите удалить эту операцию?")) {
    NProgress.start();
    try {
      const response = await apiService.deleteCashflow(id);
      if (response.data.success) {
        await loadInitialData();
      } else {
        alert(
          `Ошибка удаления: ${
            response.data.message || "Не удалось удалить операцию."
          }`
        );
      }
    } catch (error) {
      console.error("Error deleting cashflow item:", error);
      alert("Произошла критическая ошибка при удалении.");
    } finally {
      NProgress.done();
    }
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
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200;
}
.btn-icon-text {
  @apply inline-flex items-center space-x-2 transition-colors duration-150;
}
</style>
