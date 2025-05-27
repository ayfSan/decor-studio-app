<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Категории мероприятий</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить категорию</span>
      </button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Наименование
            </th>
            <th
              class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="items.length === 0">
            <td
              colspan="3"
              class="px-6 py-4 border-b border-gray-200 text-sm text-center"
            >
              Нет данных для отображения
            </td>
          </tr>
          <tr
            v-for="item in items"
            :key="item.idcategory_event"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ item.idcategory_event }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 border-b border-gray-200 text-sm">
              <button
                @click="openEditModal(item)"
                class="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                @click="confirmDeleteItem(item)"
                class="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for Add/Edit -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"
    >
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6">
          {{ isEditMode ? "Редактировать категорию" : "Добавить категорию" }}
        </h2>
        <form @submit.prevent="saveItem">
          <div class="mb-4">
            <label
              for="itemName"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Наименование</label
            >
            <input
              type="text"
              id="itemName"
              v-model="currentItem.name"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm"
            />
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              {{ isEditMode ? "Сохранить" : "Добавить" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const items = ref([
  { idcategory_event: 1, name: "Свадьба" },
  { idcategory_event: 2, name: "Корпоратив" },
  { idcategory_event: 3, name: "День рождения" },
  { idcategory_event: 4, name: "Выставка" },
]);

const isModalOpen = ref(false);
const currentItem = ref({});
const isEditMode = ref(false);

function openAddModal() {
  isEditMode.value = false;
  currentItem.value = { name: "" };
  isModalOpen.value = true;
}

function openEditModal(item) {
  isEditMode.value = true;
  currentItem.value = { ...item };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveItem() {
  if (isEditMode.value) {
    const index = items.value.findIndex(
      (i) => i.idcategory_event === currentItem.value.idcategory_event
    );
    if (index !== -1) {
      items.value[index] = { ...currentItem.value };
    }
  } else {
    items.value.push({ ...currentItem.value, idcategory_event: Date.now() }); // Replace Date.now() with actual ID from backend
  }
  closeModal();
}

function confirmDeleteItem(itemToDelete) {
  if (
    confirm(`Вы уверены, что хотите удалить категорию "${itemToDelete.name}"?`)
  ) {
    deleteItem(itemToDelete);
  }
}

function deleteItem(itemToDelete) {
  items.value = items.value.filter(
    (i) => i.idcategory_event !== itemToDelete.idcategory_event
  );
}
</script>
