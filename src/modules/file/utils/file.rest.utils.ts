import { Readable } from "node:stream";
import { wLogger } from "../../logger/logging.module";

const util = require("node:util");
const { pipeline } = require("node:stream");
const mime = require("mime-types"); // в import нельзя

/**
 * ОТПРАВИТЬ ПОТОК ПОЛЬЗОВАТЕЛЮ КАК ФАЙЛ
 * @param args.stream - поток, который нужно отправить
 * @param args.fileName - имя файла
 * @param args.isThrow [true] - при ошибке бросить throw
 */
export const writeFileRest = async (args: {
  res: any;
  stream: Readable;
  fileName: string;
  isThrow?: boolean;
}): Promise<boolean> => {
  const { res, stream, fileName, isThrow = true } = args;
  const fileNameSafe = fileName.replaceAll(",", "");
  res.set({
    "Content-Type": mime.contentType(fileName.split(".").pop()),
    "Content-disposition": `attachment; filename=${encodeURI(fileNameSafe)}`,
  });
  const pipelineAsync = util.promisify(pipeline);
  return pipelineAsync(stream, res)
    .then(() => true)
    .catch((err) => {
      wLogger.error(err);
      if (isThrow) {
        wLogger.error("Ошибка отправки файла с сервера", err);
        throw "Ошибка отправки файла с сервера";
      }
      return false;
    });
};

/**
 * ПОЛУЧИТЬ ФАЙЛ ОТ ПОЛЬЗОВАТЕЛЯ КАК ПОТОК
 * @param filePath - полный путь с именем читаемого файла
 * @param isThrow [true] - при ошибке бросить throw
 */
// export const readFileRest = async (args: {
//   filePath: string,
//   isThrow?: boolean,
// }): Promise<ReadStream> => {
//   const { filePath, isThrow = true } = args;
//   return;
//   // try {
//   //   const stream = createReadStream(filePath);
//   // } catch(err) {
//   //   console.error(err);
//   //   if (isThrow) throw 'Ошибка получения файла';
//   // }
// };
