-- Проверяем пользователя с chat_id 1020152129
SELECT id, username, first_name, last_name, telegram_chat_id, temp_token, temp_token_expires_at, temp_token_type
FROM user 
WHERE telegram_chat_id = 1020152129;

-- Проверяем всех пользователей с telegram_chat_id
SELECT id, username, first_name, last_name, telegram_chat_id
FROM user 
WHERE telegram_chat_id IS NOT NULL;

-- Проверяем пользователей с активными токенами
SELECT id, username, first_name, last_name, temp_token, temp_token_expires_at, temp_token_type
FROM user 
WHERE temp_token IS NOT NULL AND temp_token_expires_at > NOW(); 