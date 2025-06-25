-- Добавление полей для привязки Telegram аккаунта
-- Выполните этот скрипт в вашей базе данных

USE `a1142004_2d_decorstudio`;

-- Добавляем поля для кода привязки и времени его истечения
ALTER TABLE `user` 
ADD COLUMN `telegram_link_code` VARCHAR(10) NULL,
ADD COLUMN `telegram_link_code_expires_at` DATETIME NULL;

-- Добавляем индекс для быстрого поиска по коду
CREATE INDEX `idx_telegram_link_code` ON `user` (`telegram_link_code`);

-- Проверяем, что поля добавлены
DESCRIBE `user`; 