/**
 * Промежуточный .js файл,
 * т.к. запуск .ts в рабочем потоке приводит к ошибке
 */

const path = require('path');

require('ts-node').register();
require(path.resolve(__dirname, './incmail.pop3-worker.ts'));
