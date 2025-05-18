<script setup>
//#region calendar
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const daysInMonth = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value + 1, 0);
  return Array.from({ length: date.getDate() }, (_, i) => i + 1);
});

const blanks = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  // Сдвиг: JS начинается с воскресенья, мы — с понедельника
  return firstDay === 0 ? 6 : firstDay - 1;
});

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
}
//#endregion

const upcomingEvents = ref([
  { id: 1, name: "Свадьба Анны и Петра", date: "15 мая 2024" },
  { id: 2, name: "Юбилей компании", date: "20 мая 2024" },
  { id: 3, name: "Выпускной вечер", date: "25 мая 2024" },
]);

function navigateToNewEvent() {
  router.push("/events");
}

function navigateToNewTransaction() {
  router.push("/cash");
}

function navigateToNewMember() {
  router.push("/members");
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-2xl font-semibold mb-6">Панель управления</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Статистика -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">Общая статистика</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Активные мероприятия</span>
            <span class="font-medium">3</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Участники команды</span>
            <span class="font-medium">8</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Завершено в этом месяце</span>
            <span class="font-medium">5</span>
          </div>
        </div>
      </div>

      <!-- Ближайшие мероприятия -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">Ближайшие мероприятия</h2>
        <div class="space-y-4">
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="border-b pb-3 last:border-b-0"
          >
            <div class="font-medium">{{ event.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ event.date }}</div>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">Быстрые действия</h2>
        <div class="space-y-3">
          <button
            @click="navigateToNewEvent"
            class="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left flex items-center"
          >
            <span class="material-symbols-outlined mr-2">add_circle</span>
            Новое мероприятие
          </button>
          <button
            @click="navigateToNewTransaction"
            class="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left flex items-center"
          >
            <span class="material-symbols-outlined mr-2">payments</span>
            Добавить транзакцию
          </button>
          <button
            @click="navigateToNewMember"
            class="w-full py-2 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left flex items-center"
          >
            <span class="material-symbols-outlined mr-2">person_add</span>
            Добавить участника
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- scoped применяется только именно на данную страницу в остальных случаях работает везде -->
<style scoped></style>
