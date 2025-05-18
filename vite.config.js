//функция данного файла заключается в том, что он собирает и запускает приложение. прописывает все конфиги

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  base: "/decor-studio-app/", // Добавляем базовый путь для GitHub Pages
  server: {
    host: "0.0.0.0", // Разрешаем доступ с любых IP
    port: 5173, // Порт, который будет использоваться
    strictPort: true,
    allowedHosts: ["quick-vast-asp.ngrok-free.app", "all"], // Разрешаем домен ngrok и все хосты
  },
});
