<template>
  <div class="p-0">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Места проведения</h1>
      <button
        @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">add</span>
        <span class="hidden md:inline">Добавить место</span>
      </button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-cell">ID</th>
            <th class="th-cell">Название</th>
            <th class="th-cell">Адрес</th>
            <th class="th-cell">Контактное лицо</th>
            <th class="th-cell">Телефон</th>
            <th class="th-cell">Примечания</th>
            <th class="th-cell">Действия</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr v-if="venues.length === 0">
            <td colspan="7" class="td-cell text-center">
              Нет данных для отображения
            </td>
          </tr>
          <tr
            v-for="venue in venues"
            :key="venue.idvenue"
            class="hover:bg-gray-50"
          >
            <td class="td-cell">{{ venue.idvenue }}</td>
            <td class="td-cell">{{ venue.name_venue }}</td>
            <td class="td-cell">{{ venue.address }}</td>
            <td class="td-cell">{{ venue.contact_person }}</td>
            <td class="td-cell">{{ venue.phone }}</td>
            <td class="td-cell">{{ venue.notes }}</td>
            <td class="td-cell">
              <button
                @click="openEditModal(venue)"
                class="text-primary-600 hover:text-primary-800 transition-colors duration-200 mr-3"
              >
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
              <button
                @click="confirmDeleteItem(venue)"
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
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-6">
          {{ isEditMode ? "Редактировать место" : "Добавить место" }}
        </h2>
        <form
          @submit.prevent="saveVenue"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label for="name_venue" class="label-form">Название</label>
            <input
              type="text"
              id="name_venue"
              v-model="currentVenue.name_venue"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="address" class="label-form">Адрес</label>
            <input
              type="text"
              id="address"
              v-model="currentVenue.address"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="contact_person" class="label-form"
              >Контактное лицо</label
            >
            <input
              type="text"
              id="contact_person"
              v-model="currentVenue.contact_person"
              required
              class="input-field"
            />
          </div>
          <div>
            <label for="phone" class="label-form">Телефон</label>
            <input
              type="tel"
              id="phone"
              v-model="currentVenue.phone"
              required
              class="input-field"
            />
          </div>
          <div class="md:col-span-2">
            <label for="notes" class="label-form">Примечания</label>
            <textarea
              id="notes"
              v-model="currentVenue.notes"
              rows="3"
              class="input-field"
            ></textarea>
          </div>
          <div class="md:col-span-2 mt-6 flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
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

const venues = ref([
  {
    idvenue: 1,
    name_venue: 'Ресторан "Золотой Дракон"',
    address: "ул. Центральная, 10",
    contact_person: "Администратор Мария",
    phone: "+79021112233",
    notes: "Большой банкетный зал, хорошая кухня",
  },
  {
    idvenue: 2,
    name_venue: 'Лофт "Атмосфера"',
    address: "пр. Ленина, 55, оф. 301",
    contact_person: "Алексей В.",
    phone: "+79034445566",
    notes: "Современный дизайн, подходит для корпоративов",
  },
]);

const isModalOpen = ref(false);
const currentVenue = ref({});
const isEditMode = ref(false);

const defaultVenue = {
  name_venue: "",
  address: "",
  contact_person: "",
  phone: "",
  notes: "",
};

function openAddModal() {
  isEditMode.value = false;
  currentVenue.value = { ...defaultVenue };
  isModalOpen.value = true;
}

function openEditModal(venue) {
  isEditMode.value = true;
  currentVenue.value = { ...venue };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function saveVenue() {
  if (isEditMode.value) {
    const index = venues.value.findIndex(
      (v) => v.idvenue === currentVenue.value.idvenue
    );
    if (index !== -1) {
      venues.value[index] = { ...currentVenue.value };
    }
  } else {
    venues.value.push({ ...currentVenue.value, idvenue: Date.now() }); // Replace with actual ID
  }
  closeModal();
}

function confirmDeleteItem(venue) {
  if (confirm(`Вы уверены, что хотите удалить место "${venue.name_venue}"?`)) {
    deleteVenue(venue);
  }
}

function deleteVenue(venueToDelete) {
  venues.value = venues.value.filter(
    (v) => v.idvenue !== venueToDelete.idvenue
  );
}
</script>

<style scoped>
.th-cell {
  @apply px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider;
}
.td-cell {
  @apply px-6 py-4 border-b border-gray-200 text-sm;
}
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600 sm:text-sm;
}
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.btn-primary {
  @apply px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm;
}
.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm;
}
</style>
