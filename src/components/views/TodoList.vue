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
          <p v-if="!isLoading" class="text-gray-600">{{ eventName }}</p>
          <p
            v-else
            class="text-gray-500 h-6 w-48 bg-gray-200 animate-pulse rounded-md mt-1"
          ></p>
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
        <form @submit.prevent="handleAddTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Название задачи</label
            >
            <input
              v-model="newTask.title"
              type="text"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Описание</label
            >
            <textarea
              v-model="newTask.description"
              rows="3"
              class="input-field"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Приоритет</label
              >
              <select v-model="newTask.priority" class="input-field">
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Срок выполнения</label
              >
              <input
                v-model="newTask.due_date"
                type="date"
                class="input-field"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showAddTaskForm = false"
              class="btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary">Добавить</button>
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
          class="px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
          :class="
            currentFilter === filter.value
              ? 'bg-primary-100 text-primary-700 font-semibold'
              : 'hover:bg-gray-100'
          "
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Список задач -->
    <div v-if="isLoading" class="space-y-4">
      <div
        v-for="n in 3"
        :key="n"
        class="bg-white rounded-lg shadow-sm p-4 h-24 animate-pulse"
      ></div>
    </div>
    <div
      v-else-if="filteredTasks.length === 0"
      class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm"
    >
      <p>Для этого фильтра задач нет.</p>
      <p v-if="currentFilter !== 'all'">Попробуйте выбрать другой фильтр.</p>
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.idtask"
        class="bg-white rounded-lg shadow-sm p-4 flex items-start space-x-4"
      >
        <input
          type="checkbox"
          :checked="task.completed"
          @change="toggleTaskCompletion(task)"
          class="mt-1 h-5 w-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
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
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getPriorityClass(task.priority)"
                >{{ getPriorityLabel(task.priority) }}</span
              >
              <button
                @click="handleDeleteTask(task.idtask)"
                class="text-gray-400 hover:text-red-600"
                title="Удалить"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <div
            v-if="task.due_date"
            class="mt-2 flex items-center text-sm text-gray-500"
          >
            <span class="material-symbols-outlined mr-1 text-base"
              >calendar_today</span
            >
            <span>{{ formatDate(task.due_date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "@/services/api.service";
import NProgress from "nprogress";

const route = useRoute();
const router = useRouter();
const eventId = route.params.eventId;

const eventName = ref("");
const tasks = ref([]);
const isLoading = ref(true);

const showAddTaskForm = ref(false);
const currentFilter = ref("all");

const filters = [
  { label: "Все задачи", value: "all" },
  { label: "Активные", value: "active" },
  { label: "Завершенные", value: "completed" },
];

const newTask = ref({
  title: "",
  description: "",
  priority: "medium",
  due_date: null,
});

const loadData = async () => {
  isLoading.value = true;
  NProgress.start();
  try {
    const [eventRes, tasksRes] = await Promise.all([
      apiService.getEvent(eventId),
      apiService.getTasksForEvent(eventId),
    ]);

    if (eventRes.success) {
      eventName.value = eventRes.data.project_name;
    } else {
      eventName.value = "Мероприятие не найдено";
    }

    if (tasksRes.success) {
      tasks.value = tasksRes.data;
    }
  } catch (error) {
    console.error("Failed to load todo list data:", error);
    eventName.value = "Ошибка загрузки";
  } finally {
    isLoading.value = false;
    NProgress.done();
  }
};

onMounted(loadData);

const filteredTasks = computed(() => {
  switch (currentFilter.value) {
    case "active":
      return tasks.value.filter((task) => !task.completed);
    case "completed":
      return tasks.value.filter((task) => task.completed);
    default:
      return tasks.value;
  }
});

const handleAddTask = async () => {
  if (!newTask.value.title.trim()) return;
  NProgress.start();
  try {
    const taskData = { ...newTask.value, event_idevent: eventId };
    const response = await apiService.createTask(taskData);
    if (response.success) {
      tasks.value.unshift(response.data); // Add to the top of the list
      showAddTaskForm.value = false;
      newTask.value = {
        title: "",
        description: "",
        priority: "medium",
        due_date: null,
      };
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Failed to add task:", error);
    alert("Не удалось добавить задачу.");
  } finally {
    NProgress.done();
  }
};

const toggleTaskCompletion = async (task) => {
  const updatedTask = { ...task, completed: !task.completed };
  // Optimistically update UI
  const taskIndex = tasks.value.findIndex((t) => t.idtask === task.idtask);
  if (taskIndex !== -1) {
    tasks.value[taskIndex].completed = !tasks.value[taskIndex].completed;
  }

  try {
    await apiService.updateTask(task.idtask, updatedTask);
  } catch (error) {
    // Revert UI on failure
    if (taskIndex !== -1) {
      tasks.value[taskIndex].completed = !tasks.value[taskIndex].completed;
    }
    console.error("Failed to update task status:", error);
    alert("Не удалось обновить статус задачи.");
  }
};

const handleDeleteTask = async (taskId) => {
  if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;
  NProgress.start();
  try {
    const response = await apiService.deleteTask(taskId);
    if (response.success) {
      tasks.value = tasks.value.filter((t) => t.idtask !== taskId);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
    alert("Не удалось удалить задачу.");
  } finally {
    NProgress.done();
  }
};

// --- UTILITY / FORMATTING ---
const getPriorityLabel = (priority) => {
  const labels = { low: "Низкий", medium: "Средний", high: "Высокий" };
  return labels[priority] || priority;
};

const getPriorityClass = (priority) => {
  const classes = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  return classes[priority] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
  if (!dateString) return "Без срока";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
};
</script>

<style scoped>
.input-field {
  @apply w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
}
.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200;
}
.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200;
}
</style>
