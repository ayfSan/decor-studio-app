<!-- верстка хранится в template -->

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Navbar from "./components/Navbar.vue";
import { telegram } from "./utils/telegram";

const isSidebarOpen = ref(false);

const handleClickOutside = (event) => {
  // Проверяем, открыт ли навбар и был ли клик вне его области
  if (isSidebarOpen.value && !event.target.closest(".navbar-container")) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  const userData = telegram.getUserData();
  console.log("Telegram user data:", userData);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="flex min-h-screen bg-white text-gray-900">
    <!-- Mobile menu button -->
    <button
      @click.stop="isSidebarOpen = !isSidebarOpen"
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
      class="navbar-container fixed inset-0 md:sticky md:top-0 md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-16 md:w-64"
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
</style>
