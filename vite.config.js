//функция данного файла заключается в том, что он собирает и запускает приложение. прописывает все конфиги

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/decor-studio-app/", // Изменяем базовый путь для корректной работы в Telegram WebApp
  server: {
    host: "0.0.0.0", // Разрешаем доступ с любых IP
    port: 5173, // Порт, который будет использоваться
    strictPort: true,
    allowedHosts: ["ayfsan.github.io", "all"], // Разрешаем домен  и все хосты
  },
});
