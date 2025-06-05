import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "nprogress/nprogress.css";
import "./utils/nprogress.css";
import { telegram } from "./utils/telegram";

// Initialize Telegram Web App
telegram.init();

const app = createApp(App);
app.use(router);
app.mount("#app");

// Make telegram utils available globally
app.config.globalProperties.$telegram = telegram;
