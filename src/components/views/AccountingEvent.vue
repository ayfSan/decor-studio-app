<template>
  <div id="app" class="bg-white p-6 rounded-lg shadow-lg w-80">
    <h1 class="text-center text-lg font-bold mb-4">ДДС ДД.ММ.ГГ</h1>
    <p class="text-center text-gray-500 mb-4">
      Остаток <span class="font-semibold text-black">1000</span>
    </p>

    <!-- Tabs -->
    <div class="flex justify-between mb-4">
      <button
        @click="activeTab = 'income'"
        :class="{
          'bg-blue-500 text-white': activeTab === 'income',
          'bg-gray-200 text-gray-700': activeTab !== 'income',
        }"
        class="w-1/2 py-2 rounded-l-lg focus:outline-none"
      >
        Доход
      </button>
      <button
        @click="activeTab = 'expense'"
        :class="{
          'bg-blue-500 text-white': activeTab === 'expense',
          'bg-gray-200 text-gray-700': activeTab !== 'expense',
        }"
        class="w-1/2 py-2 rounded-r-lg focus:outline-none"
      >
        Расход
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'income'" class="text-center">
      <p class="text-gray-500">Название <span class="float-right">₽</span></p>
      <div class="border-t border-gray-300 mt-2 pt-2">
        <!-- Здесь можно добавить список доходов -->
        <p class="text-gray-400">Нет данных</p>
      </div>
    </div>
    <div v-if="activeTab === 'expense'" class="text-center">
      <p class="text-gray-500">Название <span class="float-right">₽</span></p>
      <div class="border-t border-gray-300 mt-2 pt-2">
        <!-- Здесь можно добавить список расходов -->
        <p class="text-gray-400">Нет данных</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<style scoped></style>
