<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const roles = [
  "Декоратор",
  "Координатор",
  "Флорист",
  "Менеджер",
  "Фотограф",
  "Видеограф",
  "Помощник",
];

const showAddMemberForm = ref(false);

const members = ref([
  {
    id: 1,
    firstName: "Анна",
    lastName: "Иванова",
    role: "Декоратор",
    phone: "+7 (999) 123-45-67",
    email: "anna@example.com",
  },
  {
    id: 2,
    firstName: "Петр",
    lastName: "Смирнов",
    role: "Координатор",
    phone: "+7 (999) 234-56-78",
    email: "petr@example.com",
  },
  {
    id: 3,
    firstName: "Мария",
    lastName: "Козлова",
    role: "Флорист",
    phone: "+7 (999) 345-67-89",
    email: "maria@example.com",
  },
]);

const newMember = ref({
  firstName: "",
  lastName: "",
  role: roles[0],
  phone: "",
  email: "",
});

const router = useRouter();

const addMember = () => {
  members.value.push({
    id: members.value.length + 1,
    ...newMember.value,
  });

  // Сброс формы
  newMember.value = {
    firstName: "",
    lastName: "",
    role: roles[0],
    phone: "",
    email: "",
  };
  showAddMemberForm.value = false;
};

const deleteMember = (id) => {
  if (confirm("Вы уверены, что хотите удалить этого участника?")) {
    members.value = members.value.filter((member) => member.id !== id);
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-0 md:p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Участники</h1>
      <button
        @click="showAddMemberForm = true"
        class="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined md:mr-2">person_add</span>
        <span class="hidden md:inline">Добавить участника</span>
      </button>
    </div>

    <!-- Форма добавления участника -->
    <div v-if="showAddMemberForm" class="mb-6">
      <div class="bg-white rounded-lg shadow-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold text-gray-700">Новый участник</h2>
          <button
            @click="showAddMemberForm = false"
            class="text-gray-500 hover:text-gray-700 p-1 rounded-full"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="addMember" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="label-form">Имя</label>
              <input
                v-model="newMember.firstName"
                type="text"
                class="input-field"
                required
              />
            </div>

            <div>
              <label class="label-form">Фамилия</label>
              <input
                v-model="newMember.lastName"
                type="text"
                class="input-field"
                required
              />
            </div>

            <div>
              <label class="label-form">Роль</label>
              <select v-model="newMember.role" class="input-field" required>
                <option
                  v-for="role_item in roles"
                  :key="role_item"
                  :value="role_item"
                >
                  {{ role_item }}
                </option>
              </select>
            </div>

            <div>
              <label class="label-form">Телефон</label>
              <input
                v-model="newMember.phone"
                type="tel"
                class="input-field"
                required
              />
            </div>
          </div>

          <div class="col-span-full">
            <label class="label-form">Email</label>
            <input
              v-model="newMember.email"
              type="email"
              class="input-field"
              required
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showAddMemberForm = false"
              class="btn-secondary"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              Добавить участника
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Список участников -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-if="members.length === 0"
        class="col-span-full text-center py-10 text-gray-500"
      >
        Нет участников для отображения.
      </div>
      <div
        v-for="member_item in members"
        :key="member_item.id"
        class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
      >
        <div class="p-6 flex-grow">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-xl text-primary-700">
                {{ member_item.firstName }} {{ member_item.lastName }}
              </h3>
              <p class="text-sm text-gray-600">{{ member_item.role }}</p>
            </div>
            <!-- Здесь можно будет добавить кнопки редактирования -->
          </div>

          <div class="space-y-2 text-sm">
            <a
              :href="'tel:' + member_item.phone"
              class="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200 group"
            >
              <span
                class="material-symbols-outlined mr-3 text-gray-500 group-hover:text-primary-500"
                >phone</span
              >
              <span>{{ member_item.phone }}</span>
            </a>
            <a
              :href="'mailto:' + member_item.email"
              class="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-200 group"
            >
              <span
                class="material-symbols-outlined mr-3 text-gray-500 group-hover:text-primary-500"
                >mail</span
              >
              <span>{{ member_item.email }}</span>
            </a>
          </div>
        </div>
        <div class="bg-gray-50 p-3 flex justify-end">
          <button
            @click="deleteMember(member_item.id)"
            class="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100 transition-colors duration-200 flex items-center text-sm"
            title="Удалить"
          >
            <span class="material-symbols-outlined text-base mr-1">delete</span>
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
/* .read-the-docs { color: #888; } */ /* Пример закомментированного стиля, который был в проблемной версии */
/* .whitespace-pre-line { white-space: pre-line; } */ /* Пример закомментированного стиля */
</style>
