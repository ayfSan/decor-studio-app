<template>
  <div
    class="bg-white border-r border-gray-200 w-64 min-h-screen overflow-y-auto shadow-lg flex flex-col"
  >
    <div class="p-4 flex-1">
      <h2 class="text-lg font-semibold text-primary-600 mb-4">Навигация</h2>
      <nav class="space-y-2">
        <router-link
          to="/"
          class="flex px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-gray-500 mr-2">home</span>
          <span>Главная</span>
        </router-link>

        <router-link
          to="/events"
          class="flex px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-gray-500 mr-2"
            >event</span
          >
          <span>Мероприятия</span>
        </router-link>

        <router-link
          to="/cash"
          class="flex px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-gray-500 mr-2"
            >payments</span
          >
          <span>Учет средств</span>
        </router-link>

        <router-link
          to="/members"
          class="flex px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-gray-500 mr-2"
            >groups</span
          >
          <span>Участники</span>
        </router-link>
      </nav>
    </div>

    <div class="p-4 border-t border-gray-200">
      <div class="rounded-lg p-3 bg-primary-50 shadow-sm">
        <h3 class="font-medium text-primary-700 mb-2">Ближайшие события</h3>
        <div class="text-sm text-gray-600">
          <p v-for="event in upcomingEvents" :key="event.id" class="mb-1">
            • {{ event.name }} — {{ event.date }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineEmits(["close-menu"]);

const upcomingEvents = ref([
  { id: 1, name: "Свадьба Анны и Петра", date: "15 мая" },
  { id: 2, name: "Юбилей компании", date: "20 мая" },
]);
</script>

<style>
.router-link-active {
  background-color: var(--primary-100);
  color: var(--primary-700);
}

.router-link-active .material-symbols-outlined {
  color: var(--primary-700);
}
</style>
