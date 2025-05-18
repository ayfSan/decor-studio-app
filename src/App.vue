<!-- верстка хранится в template -->

<script>
import { telegram } from "./utils/telegram";
import Navbar from "./components/Navbar.vue";
import { ref } from "vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
  data() {
    return {
      theme: telegram.getTheme(),
      isSidebarOpen: false,
    };
  },
  created() {
    // Получаем данные пользователя при создании приложения
    const userData = telegram.getUserData();
    console.log("Telegram user data:", userData);
  },
};
</script>

<template>
  <div class="flex min-h-screen bg-gray-50" :class="theme">
    <!-- Mobile menu button -->
    <button
      @click="isSidebarOpen = !isSidebarOpen"
      class="fixed bottom-4 right-4 z-50 md:hidden bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
    >
      <span class="material-symbols-outlined">{{
        isSidebarOpen ? "close" : "menu"
      }}</span>
    </button>

    <!-- Sidebar -->
    <Navbar
      :class="{
        'translate-x-0': isSidebarOpen,
        '-translate-x-full': !isSidebarOpen,
      }"
      class="fixed inset-0 md:sticky md:top-0 md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-16 md:w-64"
      @close-menu="isSidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 p-4 md:pl-4 w-full">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

:root {
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
}

.bg-primary-50 {
  background-color: var(--primary-50);
}
.bg-primary-100 {
  background-color: var(--primary-100);
}
.text-primary-600 {
  color: var(--primary-600);
}
.text-primary-700 {
  color: var(--primary-700);
}
.hover\:bg-primary-50:hover {
  background-color: var(--primary-50);
}
.bg-primary-600 {
  background-color: var(--primary-600);
}
.hover\:bg-primary-700:hover {
  background-color: var(--primary-700);
}

body {
  font-family: "Inter", sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}

/* Telegram theme styles */
.dark {
  background-color: #1f1f1f;
  color: #ffffff;
}

.light {
  background-color: #ffffff;
  color: #000000;
}
</style>
