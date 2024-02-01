
## Prod
# запустить скрипт install.sh
 ```перед запуском отредактируйте файл .env```
# или установить приложение в ручную
настройка БД для корректной работы приложения

1. Создать базу admin с схемой sad
2. Создать базу `name` со схемой sad (name - произвольное имя базы данных далее prod)
3. отредактируйте файл .env
```
   SMDO_DATABASE=prod
```

3. Произвести наполнение таблицами базу данных prod выполнив команду ```npm run migration:go```
 или выполнить поочерёдно ```npm run migration:generate``` ```npm run migration:run```
4. Произвести наполнение таблицами базу данных prod выполнив команду ```npm run migrateAdmin```
5. Заполнить базу данных prod - default values выполнив команды ```npm run seed:setOrg```
   ```npm run seed:setAdmin```
6. Поднять все сервисы приложения выполнив docker-compose up --build --remove-orphans -d

