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
        <h1 class="text-2xl font-semibold">Мероприятия</h1>
      </div>
      <button
        @click="createNewEvent"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined">add</span>
        <span class="ml-2 hidden sm:inline">Новое мероприятие</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="event in events"
        :key="event.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div class="bg-primary-50 p-4">
          <h3 class="font-medium text-lg">{{ event.name }}</h3>
          <p class="text-sm text-gray-600 mt-1">{{ event.date }}</p>
        </div>

        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Бюджет</span>
              <span class="font-medium">{{ event.budget }} ₽</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Потрачено</span>
              <span class="font-medium">{{ event.spent }} ₽</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Остаток</span>
              <span class="font-medium"
                >{{ event.budget - event.spent }} ₽</span
              >
            </div>
          </div>

          <div class="space-y-2">
            <button
              @click="goToEventDetails(event.id)"
              class="w-full py-2 px-4 bg-gray-100 rounded-lg text-left hover:bg-gray-200 transition-colors duration-200 flex items-center"
            >
              <span class="material-symbols-outlined mr-2 text-gray-600"
                >info</span
              >
              Детали мероприятия
            </button>
            <button
              @click="goToTodoList(event.id)"
              class="w-full py-2 px-4 bg-gray-100 rounded-lg text-left hover:bg-gray-200 transition-colors duration-200 flex items-center"
            >
              <span class="material-symbols-outlined mr-2 text-gray-600"
                >checklist</span
              >
              Чек-лист
            </button>
            <button
              class="w-full py-2 px-4 bg-gray-100 rounded-lg text-left hover:bg-gray-200 transition-colors duration-200 flex items-center"
            >
              <span class="material-symbols-outlined mr-2 text-gray-600"
                >groups</span
              >
              Участники ({{ event.members }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const events = ref([
  {
    id: 1,
    name: "Свадьба Анны и Петра",
    date: "15 мая 2024",
    budget: 500000,
    spent: 350000,
    members: 4,
  },
  {
    id: 2,
    name: "Юбилей компании",
    date: "20 мая 2024",
    budget: 300000,
    spent: 150000,
    members: 3,
  },
  {
    id: 3,
    name: "Выпускной вечер",
    date: "25 мая 2024",
    budget: 400000,
    spent: 200000,
    members: 5,
  },
]);

const goToEventDetails = (eventId) => {
  router.push(`/events/${eventId}`);
};

const goToTodoList = (eventId) => {
  router.push(`/todo/${eventId}`);
};

const createNewEvent = () => {
  // This will be implemented when we have a form for creating new events
  // For now, we'll just show an alert
  alert(
    "Функция создания нового мероприятия будет доступна в следующем обновлении"
  );
};
</script>

<style scoped></style>
