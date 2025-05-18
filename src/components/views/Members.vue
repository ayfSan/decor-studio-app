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
        <h1 class="text-2xl font-semibold">Участники команды</h1>
      </div>
      <button
        @click="showAddMemberForm = true"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
      >
        <span class="material-symbols-outlined">person_add</span>
        <span class="ml-2 hidden sm:inline">Добавить участника</span>
      </button>
    </div>

    <!-- Форма добавления участника -->
    <div v-if="showAddMemberForm" class="mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Новый участник</h2>
          <button
            @click="showAddMemberForm = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="addMember" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                v-model="newMember.firstName"
                type="text"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Фамилия
              </label>
              <input
                v-model="newMember.lastName"
                type="text"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Роль
              </label>
              <select
                v-model="newMember.role"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              >
                <option v-for="role in roles" :key="role" :value="role">
                  {{ role }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                v-model="newMember.phone"
                type="tel"
                class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="newMember.email"
              type="email"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showAddMemberForm = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Список участников -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="member in members"
        :key="member.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-medium text-lg">
                {{ member.firstName }} {{ member.lastName }}
              </h3>
              <p class="text-sm text-gray-600">{{ member.role }}</p>
            </div>
            <div class="flex space-x-2">
              <button
                class="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors duration-200"
                title="Редактировать"
              >
                <span class="material-symbols-outlined">edit</span>
                <span class="ml-2 hidden sm:inline">Редактировать</span>
              </button>
              <button
                @click="deleteMember(member.id)"
                class="text-gray-500 hover:text-red-600 p-2 rounded-lg transition-colors duration-200"
                title="Удалить"
              >
                <span class="material-symbols-outlined">delete</span>
                <span class="ml-2 hidden sm:inline">Удалить</span>
              </button>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <a
              :href="'tel:' + member.phone"
              class="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="material-symbols-outlined mr-2">phone</span>
              <span>{{ member.phone }}</span>
            </a>
            <a
              :href="'mailto:' + member.email"
              class="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
            >
              <span class="material-symbols-outlined mr-2">mail</span>
              <span>{{ member.email }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
