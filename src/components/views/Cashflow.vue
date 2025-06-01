<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Движение ДС</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить операцию</span>
      </button>
    </div>

    <div
      v-if="Object.keys(groupedCashflowItems).length === 0"
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
          class="text-xl font-semibold text-gray-700 p-4 border-b cursor-pointer flex justify-between items-center select-none hover:bg-gray-50 transition-colors duration-150"
          :class="{
            'border-primary-200 bg-primary-50': isGroupExpanded(eventIdKey),
          }"
        >
          {{ group.name }}
          <span
            class="material-symbols-outlined text-gray-500 transform transition-transform duration-200"
            :class="{ 'rotate-180': isGroupExpanded(eventIdKey) }"
          >
            expand_more
          </span>
        </h2>
        <div v-if="isGroupExpanded(eventIdKey)" class="p-4 space-y-4">
          <div
            v-if="group.items.length === 0"
            class="text-sm text-gray-500 italic"
          >
            Нет операций для этого мероприятия.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="item in group.items"
              :key="item.idcashflow"
              class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-200 hover:shadow-xl transition-shadow duration-200"
            >
              <!-- Заголовок -->
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
                    {{ item.transaction || "Операция" }} #{{ item.idcashflow }}
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

              <!-- Основной контент -->
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
                <!-- Event name is already in the group title, so event_idevent might be redundant here -->
                <p v-if="item.note" class="text-sm">
                  <strong class="font-medium">Примечание:</strong>
                  {{ item.note }}
                </p>
              </div>

              <!-- Футер с кнопками -->
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
                    @click="confirmDeleteItem(item)"
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
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"
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
            <label
              for="date"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Дата</label
            >
            <input
              type="datetime-local"
              id="date"
              v-model="currentItem.date"
              required
              class="input-field"
            />
          </div>
          <div>
            <label
              for="transaction"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Транзакция</label
            >
            <input
              type="text"
              id="transaction"
              v-model="currentItem.transaction"
              class="input-field"
            />
          </div>
          <div>
            <label
              for="account"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Счет</label
            >
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
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Категория</label
            >
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
            <label
              for="event"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Событие</label
            >
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
          <div>
            <label
              for="note"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Примечание</label
            >
            <textarea
              id="note"
              v-model="currentItem.note"
              rows="1"
              class="input-field"
            ></textarea>
          </div>
          <div>
            <label
              for="income"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Приход</label
            >
            <input
              type="number"
              step="0.01"
              id="income"
              v-model.number="currentItem.income"
              class="input-field"
            />
          </div>
          <div>
            <label
              for="expense"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Расход</label
            >
            <input
              type="number"
              step="0.01"
              id="expense"
              v-model.number="currentItem.expense"
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
import { ref, computed, onMounted } from "vue";

const cashflowItems = ref([
  {
    idcashflow: 1,
    date: "2024-05-15T10:00:00.000Z",
    transaction: "Оплата аренды зала",
    account_cashflow_idaccount_cashflow: 1,
    category_cashflow_idcategory_cashflow: 1,
    event_idevent: 101,
    income: 0,
    expense: 50000,
    note: "Аренда для свадьбы Анны и Петра",
  },
  {
    idcashflow: 2,
    date: "2024-05-16T12:30:00.000Z",
    transaction: "Получение предоплаты",
    account_cashflow_idaccount_cashflow: 2,
    category_cashflow_idcategory_cashflow: 4,
    event_idevent: 101,
    income: 100000,
    expense: 0,
    note: "Предоплата от Анны Петровой",
  },
  {
    idcashflow: 3,
    date: "2024-05-20T14:00:00.000Z",
    transaction: "Закупка материалов для декора",
    account_cashflow_idaccount_cashflow: 1,
    category_cashflow_idcategory_cashflow: 3,
    event_idevent: null,
    income: 0,
    expense: 15000,
    note: "Ткани, ленты",
  },
  {
    idcashflow: 4,
    date: "2024-06-10T09:00:00.000Z",
    transaction: "Оплата кейтеринга",
    account_cashflow_idaccount_cashflow: 3,
    category_cashflow_idcategory_cashflow: 1,
    event_idevent: 102,
    income: 0,
    expense: 120000,
    note: "Юбилей ТехноПрорыв",
  },
  {
    idcashflow: 5,
    date: "2024-06-12T18:00:00.000Z",
    transaction: "Гонорар ведущему",
    account_cashflow_idaccount_cashflow: 1,
    category_cashflow_idcategory_cashflow: 2,
    event_idevent: 102,
    income: 0,
    expense: 30000,
  },
  {
    idcashflow: 6,
    date: new Date().toISOString(),
    transaction: "Текущий доход",
    account_cashflow_idaccount_cashflow: 2,
    category_cashflow_idcategory_cashflow: 4,
    event_idevent: 101,
    income: 5000,
    expense: 0,
  },
  {
    idcashflow: 7,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    transaction: "Прошлый расход без события",
    account_cashflow_idaccount_cashflow: 1,
    category_cashflow_idcategory_cashflow: 3,
    event_idevent: null,
    income: 0,
    expense: 2500,
  },
]);

const accounts = ref([
  { idaccount_cashflow: 1, name: "Наличные RUB" },
  { idaccount_cashflow: 2, name: "Карта Сбербанк" },
  { idaccount_cashflow: 3, name: 'Расчетный счет ООО "Ромашка"' },
]);

const categories = ref([
  { idcategory_cashflow: 1, name: "Аренда" },
  { idcategory_cashflow: 2, name: "Гонорары" },
  { idcategory_cashflow: 3, name: "Материалы" },
  { idcategory_cashflow: 4, name: "Доход от мероприятия" },
]);

// Mock events list - needed for grouping by event name
const eventsList = ref([
  { idevent: 101, project_name: "Свадьба Анны и Петра" },
  { idevent: 102, project_name: 'Юбилей компании "ТехноПрорыв"' },
  { idevent: 103, project_name: "Конференция Разработчиков" }, // Example, may not have cashflow items yet
]);

const isModalOpen = ref(false);
const currentItem = ref({});
const isEditMode = ref(false);

const defaultItem = {
  date: new Date().toISOString().slice(0, 16),
  transaction: "",
  account_cashflow_idaccount_cashflow: null,
  category_cashflow_idcategory_cashflow: null,
  event_idevent: null,
  income: 0,
  expense: 0,
  note: "",
};

// Accordion state for event groups
const expandedGroups = ref({}); // Stores { 'event-101': true, 'event-null': false }

const getEventNameById = (eventId) => {
  if (eventId === null || eventId === undefined) return "Прочие операции";
  const event = eventsList.value.find((e) => e.idevent === eventId);
  return event ? event.project_name : "Неизвестное событие";
};

const groupedCashflowItems = computed(() => {
  const groups = {};
  // Sort items by date descending before grouping
  const sortedItems = [...cashflowItems.value].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  for (const item of sortedItems) {
    const eventIdKey =
      item.event_idevent === null || item.event_idevent === undefined
        ? "null"
        : String(item.event_idevent);
    if (!groups[eventIdKey]) {
      groups[eventIdKey] = {
        name: getEventNameById(item.event_idevent),
        items: [],
      };
    }
    groups[eventIdKey].items.push(item);
  }

  // Initialize expanded state for new groups (e.g., 'Прочие операции' expanded by default)
  Object.keys(groups).forEach((key) => {
    const groupId = `event-${key}`;
    if (expandedGroups.value[groupId] === undefined) {
      expandedGroups.value[groupId] = key === "null"; // Expand 'Прочие операции' by default
    }
  });

  // Order groups: specific events first, then 'Прочие операции'
  const orderedGroupKeys = Object.keys(groups).sort((a, b) => {
    if (a === "null") return 1; // 'null' (Прочие операции) always last
    if (b === "null") return -1;
    // Optional: sort events by name or other criteria if needed
    return groups[a].name.localeCompare(groups[b].name);
  });

  const orderedGroups = {};
  orderedGroupKeys.forEach((key) => {
    orderedGroups[key] = groups[key];
  });

  return orderedGroups;
});

const toggleGroup = (eventIdKey) => {
  const groupId = `event-${eventIdKey}`;
  expandedGroups.value[groupId] = !expandedGroups.value[groupId];
};

const isGroupExpanded = (eventIdKey) => {
  const groupId = `event-${eventIdKey}`;
  return !!expandedGroups.value[groupId]; // Ensure boolean, default to false if undefined
};

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}

function formatCurrency(value) {
  const val = parseFloat(value);
  if (isNaN(val)) return "-";
  return val.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  });
}

const getAccountName = (id) => {
  const account = accounts.value.find((acc) => acc.idaccount_cashflow === id);
  return account ? account.name : "N/A";
};

const getCategoryName = (id) => {
  const category = categories.value.find(
    (cat) => cat.idcategory_cashflow === id
  );
  return category ? category.name : "N/A";
};

function openAddModal() {
  isEditMode.value = false;
  currentItem.value = {
    ...defaultItem,
    date: new Date().toISOString().slice(0, 16),
  };
  isModalOpen.value = true;
}

function openEditModal(item) {
  isEditMode.value = true;
  const dateForInput = item.date
    ? new Date(item.date).toISOString().slice(0, 16)
    : "";
  currentItem.value = { ...item, date: dateForInput };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveItem() {
  if (currentItem.value.date) {
    const localDate = new Date(currentItem.value.date);
    currentItem.value.date = new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    ).toISOString();
  }
  if (isEditMode.value) {
    const index = cashflowItems.value.findIndex(
      (i) => i.idcashflow === currentItem.value.idcashflow
    );
    if (index !== -1) {
      cashflowItems.value[index] = { ...currentItem.value };
    }
  } else {
    currentItem.value.idcashflow =
      cashflowItems.value.length > 0
        ? Math.max(...cashflowItems.value.map((i) => i.idcashflow)) + 1
        : 1;
    cashflowItems.value.push({ ...currentItem.value });
  }
  closeModal();
}

function confirmDeleteItem(itemToDelete) {
  if (
    confirm(
      `Вы уверены, что хотите удалить операцию "${itemToDelete.transaction}"?`
    )
  ) {
    deleteItem(itemToDelete);
  }
}

function deleteItem(itemToDelete) {
  cashflowItems.value = cashflowItems.value.filter(
    (i) => i.idcashflow !== itemToDelete.idcashflow
  );
}

// Initialize expanded groups on mount after initial computation
onMounted(() => {
  const initialGroups = groupedCashflowItems.value;
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
</style>
