import iconv from "iconv-lite";
import { QueryRunner } from "typeorm";
import { simpleParser } from "mailparser";
import { parentPort } from "worker_threads";

import { POP3Client } from "src/modules/incmail/utils/poplib1";
import { Incmail } from "../../../common/interfaces/incmail.interface";
import { getDataSourceAdmin } from "../../../database/datasource/tenancy/tenancy.utils";
import { incmailSave } from "./incmail.save.utils";
import { getSettingsList, setSettings } from "../../settings/settings.util";
import { SETTING_CONST } from "src/modules/settings/settings.const";
import { initWinston } from "../../logger/logging.module";
import { LOGGER } from "../../../app.const";

const POP3_PORT = SETTING_CONST.EMAIL_POP3_PORT.nm;
const POP3_HOST = SETTING_CONST.EMAIL_POP3_HOST.nm;
const POP3_USER = SETTING_CONST.EMAIL_POP3_USER.nm;
const POP3_PASS = SETTING_CONST.EMAIL_POP3_PASS.nm;
const POP3_TLSERRS = SETTING_CONST.EMAIL_POP3_TLS_ERRIGNOGE.nm;
const POP3_ENABLETLS = SETTING_CONST.EMAIL_POP3_TLS_ENABLED.nm;

// Обработка сообщений из основного потока
parentPort.on("message", async (org) => {
  // инициализация
  initWinston(LOGGER.TITLE);

  // установить настройки
  await setSettings();

  const dataSource = await getDataSourceAdmin(org);

  const data: Record<string, string> = getSettingsList({
    org: org,
    keys: [POP3_PORT, POP3_HOST, POP3_USER, POP3_PASS, POP3_TLSERRS, POP3_ENABLETLS],
  });

  if (!data[POP3_PORT] || !data[POP3_HOST] || !data[POP3_USER] || !data[POP3_PASS]) {
    parentPort.postMessage("Не заданы порт, хост, логин или пароль почты");
  }

  const port = data[POP3_PORT];
  const host = data[POP3_HOST];
  const username = data[POP3_USER];
  const password = data[POP3_PASS];
  const tlserrs = data[POP3_TLSERRS] === "true" ? true : false;
  const enabletls = data[POP3_ENABLETLS] === "true" ? true : false;
  let guid;

  const client = new POP3Client(port, host, {
    ignoretlserrs: tlserrs,
    enabletls,
    debug: false,
  });

  /** Ошибка подключения к почтовому серверу */
  client.on("error", (err) => {
    if (err.errno === 111) {
      parentPort.postMessage("Unable to connect to server");
    } else {
      parentPort.postMessage(err?.message);
    }
    return parentPort.close();
  });

  /** Событие connect генерируется при попытке подключения */
  client.on("connect", () => {
    client.login(username, password);
  });

  /**
   * Событие invalid-state генерируется, когда предпринимается попытка действия,
   * не разрешенного в текущем состоянии
   */
  client.on("invalid-state", (cmd) => {
    parentPort.postMessage(`Invalid state. You tried calling ${cmd}`);
    return parentPort.close();
  });

  /**
   * Событие locked генерируется, когда метод вызывается,
   * когда существующее выполнение еще не завершено
   * (например, при попытке получить RETR сообщение, пока удаленный сервер не завершил отправку LIST данных)
   */
  client.on("locked", (cmd) => {
    parentPort.postMessage(`Current command has not finished yet. You tried calling ${cmd}`);
    return parentPort.close();
  });

  /** Завершение POP3 сессии */
  client.on("quit", (status, rawdata) => {
    client.removeAllListeners("close");
    if (status === false) {
      parentPort.postMessage("QUIT failed");
    }
    return parentPort.close();
  });

  /** Регистрации клиента на РОРЗ сервере */
  client.on("login", (status, rawdata) => {
    if (status) {
      client.list();
    } else {
      parentPort.postMessage("LOGIN/PASS failed");
      client.quit();
      return parentPort.close();
    }
  });

  /** Получает информацию о содержимом почты */
  client.on("list", (status, msgcount) => {
    if (status === false) {
      parentPort.postMessage("LIST failed");
      return client.quit();
    } else if (msgcount > 0) {
      client.uidl(msgcount);
    } else {
      parentPort.postMessage("");
      return client.quit();
    }
  });

  /** Получает uid сообщения */
  client.on("uidl", (status, msgnumber, data) => {
    if (!status) {
      parentPort.postMessage("UIDL failed");
      return client.quit();
    }
    client.msgnumber = msgnumber;
    guid = data[msgnumber];
    client.retr(msgnumber);
  });

  /** Получает содержимое сообщения */
  client.on("retr", (status, msgnumber, data) => {
    if (!status) {
      parentPort.postMessage("RETR failed");
      return client.quit();
    }

    simpleParser(iconv.encode(data, "win1251"), async (err, parsed) => {
      if (err) {
        parentPort.postMessage(err?.message);
        return client.quit();
      }

      const mail: Incmail = {
        sender: parsed.from.text,
        email: username,
        uid: guid,
        subject: parsed.subject,
        body: parsed.text,
        html: parsed.textAsHtml,
        dt: parsed.date,
        attachments: parsed.attachments,
      };

      let isSave = false;
      const queryRunner: QueryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Сохраняем письмо
        await incmailSave({
          manager: queryRunner.manager,
          mails: [mail],
        });
        // Письмо успешно сохранилось
        isSave = true;
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      // При успешном сохранении письма в БД, помечаем его как удаленное
      if (isSave) {
        return client.dele(msgnumber);
      }
      return nextuidl(client);
    });
  });

  /**
   * Сервер POP3 помечает сообщение как удаленное,
   * но не удалет его, пока сессия не перейдёт в режим UPDATE (client.quit())
   */
  client.on("dele", (status, rawdata) => {
    if (status === false) {
      parentPort.postMessage("DELE failed");
    }
    return nextuidl(client);
  });
});

async function nextuidl(client): Promise<any> {
  // Вызывает обработку следующего сообщения
  if (client.msgnumber > 1) {
    return client.uidl(client.msgnumber - 1);
  }

  parentPort.postMessage(null);
  return client.quit();
}
