# ВАЖНО

- при обновлении токена проверяется допустимое время бездействия пользователя
- декоратор @indifferentActivity отключает коррекцию времени бездействия пользователя (infoNotify, getNewToken). Данные методы прописывать и на фронте в apolloConfig.ts (loadingLink)
- при ошибке аутентификации из-за неактивности пользователя бросать кастомное исключение APIErrorCodeEnum.auth_timeout

