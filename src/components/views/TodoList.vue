<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 flex items-center"
          title="Назад"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-semibold">Чек-лист мероприятия</h1>
          <p class="text-gray-600">{{ eventName }}</p>
        </div>
      </div>
      <button
        @click="showAddTaskForm = true"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined">add_task</span>
        <span class="ml-2 hidden sm:inline">Добавить задачу</span>
      </button>
    </div>

    <!-- Форма добавления задачи -->
    <div v-if="showAddTaskForm" class="mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Новая задача</h2>
          <button
            @click="showAddTaskForm = false"
            class="text-gray-500 hover:text-gray-700"
            title="Закрыть"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="addTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Название задачи
            </label>
            <input
              v-model="newTask.title"
              type="text"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Приоритет
              </label>
              <select
                v-model="newTask.priority"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Срок выполнения
              </label>
              <input
                v-model="newTask.dueDate"
                type="date"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showAddTaskForm = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          class="px-4 py-2 rounded-lg transition-colors duration-200"
          :class="
            currentFilter === filter.value
              ? 'bg-primary-100 text-primary-700'
              : 'hover:bg-gray-100'
          "
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Список задач -->
    <div class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white rounded-lg shadow-sm p-4 flex items-start space-x-4"
      >
        <input
          type="checkbox"
          v-model="task.completed"
          class="mt-1 rounded text-primary-600 focus:ring-primary-500"
        />

        <div class="flex-1">
          <div class="flex items-start justify-between">
            <div>
              <h3
                class="font-medium"
                :class="{ 'line-through text-gray-500': task.completed }"
              >
                {{ task.title }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">{{ task.description }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="text-sm"
                :class="{
                  'text-red-600': task.priority === 'high',
                  'text-yellow-600': task.priority === 'medium',
                  'text-green-600': task.priority === 'low',
                }"
              >
                {{ getPriorityLabel(task.priority) }}
              </span>
              <button
                @click="deleteTask(task.id)"
                class="text-gray-500 hover:text-red-600"
                title="Удалить"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>

          <div class="mt-2 flex items-center text-sm text-gray-500">
            <span class="material-symbols-outlined mr-1">calendar_today</span>
            <span>{{ formatDate(task.dueDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const eventId = route.params.eventId;
const eventName = ref("Свадьба Анны и Петра"); // В реальном приложении это будет загружаться из базы данных

const showAddTaskForm = ref(false);
const currentFilter = ref("all");

const filters = [
  { label: "Все задачи", value: "all" },
  { label: "Активные", value: "active" },
  { label: "Завершенные", value: "completed" },
];

const tasks = ref([
  {
    id: 1,
    title: "Заказать цветы",
    description: "Составить букет невесты и украшения для столов",
    completed: false,
    priority: "high",
    dueDate: "2024-05-10",
  },
  {
    id: 2,
    title: "Согласовать меню",
    description:
      "Обсудить меню с кейтерингом и утвердить окончательный вариант",
    completed: true,
    priority: "medium",
    dueDate: "2024-05-05",
  },
  {
    id: 3,
    title: "Подготовить план рассадки",
    description: "Составить схему рассадки гостей",
    completed: false,
    priority: "low",
    dueDate: "2024-05-12",
  },
]);

const newTask = ref({
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
});

const filteredTasks = computed(() => {
  if (currentFilter.value === "all") return tasks.value;
  if (currentFilter.value === "active")
    return tasks.value.filter((task) => !task.completed);
  if (currentFilter.value === "completed")
    return tasks.value.filter((task) => task.completed);
  return tasks.value;
});

const addTask = () => {
  tasks.value.push({
    id: tasks.value.length + 1,
    ...newTask.value,
    completed: false,
  });

  // Сброс формы
  newTask.value = {
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  };
  showAddTaskForm.value = false;
};

const deleteTask = (id) => {
  if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
    tasks.value = tasks.value.filter((task) => task.id !== id);
  }
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
  };
  return labels[priority];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>
