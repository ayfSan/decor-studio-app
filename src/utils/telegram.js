const tg = window.Telegram.WebApp;

export const telegram = {
  // Инициализация приложения
  init() {
    tg.ready();
    tg.expand();
  },

  // Закрыть приложение
  close() {
    tg.close();
  },

  // Получить данные пользователя
  getUserData() {
    return tg.initDataUnsafe?.user || {};
  },

  // Показать уведомление
  showAlert(message) {
    return tg.showAlert(message);
  },

  // Показать всплывающее сообщение
  showPopup(params) {
    return tg.showPopup(params);
  },

  // Установить основной цвет кнопки
  setMainButtonParams(params) {
    if (tg.MainButton) {
      tg.MainButton.setParams(params);
    }
  },

  // Показать основную кнопку
  showMainButton() {
    if (tg.MainButton) {
      tg.MainButton.show();
    }
  },

  // Скрыть основную кнопку
  hideMainButton() {
    if (tg.MainButton) {
      tg.MainButton.hide();
    }
  },

  // Получить тему
  getTheme() {
    return tg.colorScheme;
  },
};

export default telegram;
