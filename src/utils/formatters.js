/**
 * Форматирует сумму в локализованную строку валюты.
 * @param {number | string} value - Числовое или строковое значение.
 * @returns {string} - Отформатированная строка, например, "123 456,78 ₽".
 */
export function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return "0 ₽";
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Форматирует дату в короткий локализованный формат.
 * @param {string | Date} dateString - Строка с датой или объект Date.
 * @returns {string} - Отформатированная строка, например, "15.07.2024".
 */
export function formatDateShort(dateString) {
  if (!dateString || new Date(dateString).getFullYear() < 2000) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
}

/**
 * Форматирует дату и время в длинный локализованный формат.
 * @param {string | Date} dateString - Строка с датой или объект Date.
 * @returns {string} - Отформатированная строка, например, "15 июля 2024 г., 14:00".
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
