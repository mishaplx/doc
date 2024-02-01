import path from "path";
import { Worker } from "worker_threads";

const workerPath = "./incmail.pop3-worker.js";

/********************************************
 * ПРОЧИТАТЬ POP3 ПОЧТУ
 ********************************************/
export const getMailsPOP3 = async (org: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, workerPath));

    // Передача данных в рабочий поток
    worker.postMessage(org);

    // Обработка сообщений из рабочего потока
    worker.on("message", (result) => {
      return resolve(result);
    });

    // Обработка ошибок в рабочем потоке
    worker.on("error", (error) => {
      return reject(error);
    });

    // Обработка завершения рабочего потока
    worker.on("exit", (code) => {
      if (code !== 0) {
        return reject(new Error(`Рабочий поток завершился с кодом ошибки ${code}`));
      }
    });
  });
};
