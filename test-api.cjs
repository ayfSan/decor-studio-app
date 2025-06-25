const axios = require("axios");

// URL вашего сервера на Render
const API_URL = "https://decor-studio-app.onrender.com/api";

async function testAPI() {
  console.log("Testing API connection...");
  console.log("API URL:", API_URL);

  try {
    // Тестируем базовый эндпоинт
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 10000, // 10 секунд таймаут
    });
    console.log("✅ API is accessible");
    console.log("Response:", response.data);
  } catch (error) {
    console.log("❌ API connection failed");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else if (error.request) {
      console.log("No response received");
      console.log("Request:", error.request);
    } else {
      console.log("Error:", error.message);
    }
  }
}

testAPI();
