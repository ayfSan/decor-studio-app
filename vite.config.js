//функция данного файла заключается в том, что он собирает и запускает приложение. прописывает все конфиги

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./", // Изменяем базовый путь для корректной работы в Telegram WebApp
  server: {
    host: "0.0.0.0", // Разрешаем доступ с любых IP
    port: 5173, // Порт, который будет использоваться
    strictPort: true,
    allowedHosts: ["quick-vast-asp.ngrok-free.app", "all"], // Разрешаем домен ngrok и все хосты
  },
});
