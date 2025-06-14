import { createRouter, createWebHistory } from "vue-router";
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
import authService from "../services/auth.service.js";

//import Reports from '@/views/Reports.vue' //пока нет
//import Settings from '@/views/Settings.vue' //пока нет

//путь в строке поиске
const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "Вход", hideNavbar: true },
  },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Главная", requiresAuth: true },
  },
  {
    path: "/events",
    name: "Events",
    component: Events,
    meta: { title: "Мероприятия", requiresAuth: true },
  },
  {
    path: "/event/:eventId",
    name: "EventDetail",
    component: EventDetail,
    props: true,
    meta: { title: "Детали мероприятия", requiresAuth: true },
  },
  //{ path: '/reports', component: Reports },
  //{ path: '/settings', component: Settings }
  {
    path: "/analytics",
    name: "Analytics",
    component: Analytics,
    meta: { title: "Аналитика", requiresAuth: true },
  },
  {
    path: "/cash",
    name: "CashAccounting",
    component: CashAccounting,
    meta: { title: "Общий Учет средств", requiresAuth: true },
  },
  {
    path: "/members",
    name: "Members",
    component: Members,
    meta: { title: "Участники", requiresAuth: true },
  },
  {
    path: "/todo/:eventId",
    name: "TodoList",
    component: TodoList,
    props: true,
    meta: { title: "Чек-лист", requiresAuth: true },
  },
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
  {
    path: "/admin/users",
    name: "UserManagement",
    component: User,
    meta: { title: "Пользователи системы", requiresAuth: true },
  },
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
});

//перехватчик (хук) перед каждым переходом
router.beforeEach((to, from, next) => {
  const loggedIn = authService.isAuthenticated();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  const defaultTitle = "2d_decorstudio"; //стандартное название страницы по умолчанию
  document.title = to.meta.title
    ? `${to.meta.title} | ${defaultTitle}`
    : defaultTitle; //автоподстановка названия страниц при переходе с добавлением константы

  if (requiresAuth && !loggedIn) {
    next("/login");
  } else if (to.path === "/login" && loggedIn) {
    next("/");
  } else {
    next();
  }
});

export default router;
