import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/auth.store";

// Импорт компонентов страниц
import Home from "../components/views/Home.vue";
import Events from "../components/views/Events.vue";
import CashAccounting from "../components/views/CashAccounting.vue";
import Members from "../components/views/Members.vue";
import TodoList from "../components/views/TodoList.vue";
import NotFound from "../components/views/NotFound.vue";
import AccountCashflow from "../components/views/AccountCashflow.vue";
import CategoryCashflow from "../components/views/CategoryCashflow.vue";
import Cashflow from "../components/views/Cashflow.vue";
import CategoryEvent from "../components/views/CategoryEvent.vue";
import Customer from "../components/views/Customer.vue";
import Venue from "../components/views/Venue.vue";
import Document from "../components/views/Document.vue";
import User from "../components/views/User.vue";
import EventDetail from "../components/views/EventDetail.vue";
import Analytics from "../components/views/Analytics.vue";
import DocumentTemplates from "../components/views/DocumentTemplates.vue";
import Login from "../components/views/Login.vue";
import Settings from "../components/views/Settings.vue";

// Определяем маршруты приложения
const routes = [
  // Маршрут для страницы входа
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "Вход", hideNavbar: true },
  },
  // Главная страница
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Главная", requiresAuth: true },
  },
  // Страница мероприятий
  {
    path: "/events",
    name: "Events",
    component: Events,
    meta: { title: "Мероприятия", requiresAuth: true },
  },
  // Детальная страница мероприятия
  {
    path: "/event/:eventId",
    name: "EventDetail",
    component: EventDetail,
    props: true,
    meta: { title: "Детали мероприятия", requiresAuth: true },
  },
  // Страница аналитики
  {
    path: "/analytics",
    name: "Analytics",
    component: Analytics,
    meta: { title: "Аналитика", requiresAuth: true },
  },
  // Страница учета средств
  {
    path: "/cash",
    name: "CashAccounting",
    component: CashAccounting,
    meta: { title: "Общий Учет средств", requiresAuth: true },
  },
  // Страница команды/участников
  {
    path: "/members",
    name: "Members",
    component: Members,
    meta: { title: "Команда", requiresAuth: true },
  },
  // Чек-лист для мероприятия
  {
    path: "/todo/:eventId",
    name: "TodoList",
    component: TodoList,
    props: true,
    meta: { title: "Чек-лист", requiresAuth: true },
  },
  // --- Раздел "Финансы" ---
  {
    path: "/finance/accounts",
    name: "AccountCashflow",
    component: AccountCashflow,
    meta: { title: "Счета ДС", requiresAuth: true },
  },
  {
    path: "/finance/categories",
    name: "CategoryCashflow",
    component: CategoryCashflow,
    meta: { title: "Категории ДС", requiresAuth: true },
  },
  {
    path: "/finance/operations",
    name: "Cashflow",
    component: Cashflow,
    meta: { title: "Движение ДС", requiresAuth: true },
  },
  // --- Раздел "Справочники" ---
  {
    path: "/directory/event-categories",
    name: "CategoryEvent",
    component: CategoryEvent,
    meta: { title: "Категории мероприятий", requiresAuth: true },
  },
  {
    path: "/directory/customers",
    name: "Customer",
    component: Customer,
    meta: { title: "Клиенты", requiresAuth: true },
  },
  {
    path: "/directory/venues",
    name: "Venue",
    component: Venue,
    meta: { title: "Места проведения", requiresAuth: true },
  },
  {
    path: "/directory/documents",
    name: "Document",
    component: Document,
    meta: { title: "Документы", requiresAuth: true },
  },
  {
    path: "/directory/document-templates",
    name: "DocumentTemplates",
    component: DocumentTemplates,
    meta: { title: "Шаблоны документов", requiresAuth: true },
  },
  // --- Раздел "Администрирование" ---
  {
    path: "/admin/users",
    name: "UserManagement",
    component: User,
    meta: {
      title: "Пользователи системы",
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  // --- Настройки ---
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { title: "Настройки", requiresAuth: true },
  },
  // --- Страница не найдена ---
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { title: "Страница не найдена" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

//перехватчик (хук) перед каждым переходом
router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title} | CRM` || "CRM";

  // Динамический импорт store, чтобы избежать проблем с порядком инициализации
  const authStore = useAuthStore();

  // Запускаем проверку состояния аутентификации из localStorage при первой загрузке
  if (!from.name) {
    console.log(
      "[ROUTER GUARD] First navigation, checking auth from localStorage."
    );
    await authStore.checkAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;
  console.log(
    `[ROUTER GUARD] Navigating to '${to.path}'. User is authenticated: ${isAuthenticated}`
  );

  // 1. Если маршрут требует аутентификации, а пользователь не залогинен
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log(
      `[ROUTER GUARD] Access DENIED. Storing returnUrl '${to.fullPath}' and redirecting to /login.`
    );
    authStore.returnUrl = to.fullPath;
    return next("/login");
  }

  // 2. Если пользователь залогинен и пытается зайти на страницу логина
  if (to.name === "Login" && isAuthenticated) {
    return next({ name: "Home" });
  }

  // 3. Проверка ролей доступа
  if (to.meta.roles) {
    const userRoles = authStore.userRoles;
    const requiredRoles = to.meta.roles;

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      // Если нет нужной роли, перенаправляем на главную
      // В будущем можно сделать страницу "Доступ запрещен"
      return next({ name: "Home" });
    }
  }

  next();
});

export default router;
