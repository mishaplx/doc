import { Readable } from "stream";
import { customError } from "../../../common/type/errorHelper.type";

/********************************************
 * ПРЕОБРАЗОВАТЬ БУФЕР В ПОТОК
 ********************************************/
export const bufferToStream = (buffer: Buffer): Readable => {
  if (!Buffer.isBuffer(buffer)) {
    throw "Источник данных не буфер";
  }
  return Readable.from(buffer);
};

/********************************************
 * ПРЕОБРАЗОВАТЬ ПОТОК В БУФЕР
 ********************************************/
export const streamToBuffer = async (stream): Promise<Buffer> => {
  const buffers = [];
  try {
    for await (const data of stream) {
      buffers.push(data);
    }
    return Buffer.concat(buffers);
  } catch (err) {
    customError("Ошибка чтения файла в буфер");
  }
};
