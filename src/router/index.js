import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/views/Home.vue";
import Events from "../components/views/Events.vue";
import CashAccounting from "../components/views/CashAccounting.vue";
import Members from "../components/views/Members.vue";
import TodoList from "../components/views/TodoList.vue";
import NotFound from "../components/views/NotFound.vue";
import AccountingEvent from "../components/views/AccountingEvent.vue";

//import Reports from '@/views/Reports.vue' //пока нет
//import Settings from '@/views/Settings.vue' //пока нет

//путь в строке поиске
const routes = [
  //{ path: "/", component: Home, meta: { title: "Главная" } },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Главная" },
  },
  {
    path: "/events",
    name: "Events",
    component: Events,
    meta: { title: "Мероприятия" },
  },
  {
    path: "/events/cash_accounting",
    name: "AccountingEvent",
    component: AccountingEvent,
    meta: { title: "Учет средств мероприятия" },
  },
  //{ path: '/reports', component: Reports },
  //{ path: '/settings', component: Settings }
  {
    path: "/cash",
    name: "CashAccounting",
    component: CashAccounting,
    meta: { title: "Учет средств" },
  },
  {
    path: "/members",
    name: "Members",
    component: Members,
    meta: { title: "Участники" },
  },
  {
    path: "/todo/:eventId",
    name: "TodoList",
    component: TodoList,
    props: true,
    meta: { title: "Чек-лист" },
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
  const defaultTitle = "2d_secorstudio"; //стандартное название страницы по умолчанию
  document.title = to.meta.title
    ? `${to.meta.title} | ${defaultTitle}`
    : defaultTitle; //автоподстановка названия страниц при переходе с добавлением константы

  //document.title = to.meta.title || defaultTitle
  next();
});

export default router;
