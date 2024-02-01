import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { Incmail, Options, Source } from "../../../common/interfaces/incmail.interface";
import { customError } from "../../../common/type/errorHelper.type";

const MESSAGE_FLAG_SEEN = "\\Seen";

// const getHost = (usr: string): string => {
//   const hosts = {
//     'tut.by': 'imap.yandex.ru',
//     'yandex.ru': 'imap.yandex.ru',
//     'gmail.com': 'imap.gmail.com',
//   };
//   return hosts[usr] || 'imap.' + usr;
// }

export const getOption = (args: { host: string; email: string; pass: string }): Options => ({
  host: args.host,
  port: 993,
  secure: true,
  auth: {
    user: args.email,
    pass: args.pass,
  },
  tls: { rejectUnauthorized: false },
});

/********************************************
 * ПРОЧИТАТЬ НЕПРОЧИТАННУЮ ПОЧТУ
 ********************************************/
export const getImapperUnseen = async (options: Options): Promise<Incmail[]> => {
  const sources: Source[] = [];
  const mails: Incmail[] = [];

  try {
    const client: ImapFlow = new ImapFlow(options);
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");
    try {
      for await (const msg of client.fetch({ seen: false }, { source: true })) {
        // Сохранить буфер сообщений
        sources.push({
          uid: msg.uid,
          source: msg.source,
        });
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (e) {
    customError(`Ошибка чтения почты. Возможно не верно заданы параметры. ${e.message}`);
  }

  // Парсить письма
  for await (const msg of sources) {
    mails.push(await pareseImapper(options.auth.user, msg.uid, msg.source));
  }

  return Promise.resolve(mails);
};

/********************************************
 * ПАРСИТЬ ПИСЬМО
 ********************************************/
export const pareseImapper = (email: string, uid: string, source: Buffer): Promise<Incmail> => {
  return new Promise((resolve, reject) => {
    simpleParser(source, async (err, parsed) => {
      if (err) {
        return reject(err);
      }

      return resolve({
        sender: parsed.from.text,
        email: email,
        uid: String(uid),
        subject: parsed.subject,
        body: parsed.text,
        html: parsed.textAsHtml,
        dt: parsed.date,
        attachments: parsed.attachments,
      });
    });
  });
};

/********************************************
 * Достать uid входящих сообщений
 ********************************************/
export const getImapperUidAll = async (options: Options): Promise<string[]> => {
  const uids: string[] = [];

  try {
    const client: ImapFlow = new ImapFlow(options);
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");
    try {
      for await (const msg of client.fetch("1:*", { uid: true })) {
        uids.push(String(msg.uid));
      }
    } finally {
      // use finally{} to make sure lock is released even if exception occurs
      lock.release();
    }

    await client.logout();
  } catch (e) {
    customError(`Ошибка чтения почты. Возможно не верно заданы параметры. ${e.message}`);
  }

  return Promise.resolve(uids);
};

/********************************************
 * Установить флаги для сообщения или диапазона сообщений
 * @param options - Параметры IMAP-соединения
 * @param uids - Идентификаторы сообщений. Пример: '1,2,3'
 * @param flag - Флаг сообщения
 ********************************************/
export const setImapperFlag = async (
  options: Options,
  uids: string,
  flag: string,
): Promise<void> => {
  const client: ImapFlow = new ImapFlow(options);
  await client.connect();

  const lock = await client.getMailboxLock("INBOX");
  try {
    await client.messageFlagsAdd({ uid: uids }, [flag]);
  } finally {
    lock.release();
  }

  await client.logout();
  return Promise.resolve();
};

/********************************************
 * пометить письма как прочитанные
 ********************************************/
export const setImapperSeen = async (options: Options, uids: string): Promise<void> => {
  return setImapperFlag(options, uids, MESSAGE_FLAG_SEEN);
};
