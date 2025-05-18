<template>
  <div
    class="bg-white border-r border-gray-200 w-64 min-h-screen overflow-y-auto shadow-lg flex flex-col"
    @click.stop
  >
    <div class="p-4 flex-1">
      <h2 class="text-xl font-bold text-gray-800 mb-6">Навигация</h2>
      <nav class="space-y-2">
        <router-link
          to="/"
          class="flex px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-blue-600 mr-3">home</span>
          <span class="font-medium">Главная</span>
        </router-link>

        <router-link
          to="/events"
          class="flex px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-blue-600 mr-3"
            >event</span
          >
          <span class="font-medium">Мероприятия</span>
        </router-link>

        <router-link
          to="/cash"
          class="flex px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-blue-600 mr-3"
            >payments</span
          >
          <span class="font-medium">Учет средств</span>
        </router-link>

        <router-link
          to="/members"
          class="flex px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors duration-200 items-center"
          @click="$emit('close-menu')"
        >
          <span class="material-symbols-outlined text-blue-600 mr-3"
            >groups</span
          >
          <span class="font-medium">Участники</span>
        </router-link>
      </nav>
    </div>

    <div class="p-4 border-t border-gray-200">
      <div class="rounded-lg p-4 bg-blue-50 shadow-sm">
        <h3 class="font-semibold text-blue-800 mb-3">Ближайшие события</h3>
        <div class="text-sm text-gray-700">
          <p v-for="event in upcomingEvents" :key="event.id" class="mb-2">
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
  background-color: #eff6ff;
  color: #1e40af;
  font-weight: 600;
}

.router-link-active .material-symbols-outlined {
  color: #2563eb;
}
</style>
