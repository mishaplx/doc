import "dotenv/config";

import { Readable } from "node:stream";

import { v4 as uuidv4 } from "uuid";

import { customError } from "../../../common/type/errorHelper.type";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { FILE } from "../file.const";
import { wLogger } from "src/modules/logger/logging.module";

const fs = require("node:fs");
const path = require("node:path");
const util = require("node:util");
const zlib = require("node:zlib");
const mime = require("mime-types"); // в import нельзя
const { pipeline } = require("node:stream");

/********************************************
 * СФОРМИРОВАТЬ ПУТЬ К КАТАЛОГУ, КАТАЛОГ НЕ СОЗДАЕТСЯ
 ********************************************/
const getFolderVolume = (org: string, date: Date): string => {
  const year = String(new Date(date).getFullYear());
  const month = ("0" + (new Date(date).getMonth() + 1)).slice(-2);
  const day = ("0" + new Date(date).getDate()).slice(-2);
  return path.join(process.env.FILE_STAGE, org, year, month, day);
};

/********************************************
 * СФОРМИРОВАТЬ ПОЛНЫЙ ПУТЬ (КАТАЛОГ И ИМЯ УНИКАЛЬНОГО ФАЙЛА), КАТАЛОГ НЕ СОЗДАЕТСЯ
 ********************************************/
export const getPathVolume = (
  org: string,
  date_create: Date = new Date(),
  volume_name: string = uuidv4(),
): string => {
  return path.join(getFolderVolume(org, date_create), volume_name + FILE.VOLUME.EXT);
};

/********************************************
 * СФОРМИРОВАТЬ ПОЛНЫЙ ПУТЬ ПО ЕГО FileItemEntity
 ********************************************/
export const getPathVolumeEntity = (org: string, fileItemEntity: FileItemEntity): string =>
  getPathVolume(org, fileItemEntity.date_create, fileItemEntity.volume);

/********************************************
 * ПРОВЕРИТЬ НАЛИЧИЕ ПАПОК, ПРИ ИХ ОТСУТСТВИИ - СОЗДАТЬ
 ********************************************/
export const createPath = async (pathOnly: string): Promise<any> =>
  fs.promises
    .access(pathOnly, fs.constants.R_OK | fs.constants.W_OK)
    .catch(() => fs.mkdirSync(pathOnly, { recursive: true }));

/********************************************
 * ПРОВЕРИТЬ НАЛИЧИЕ ФАЙЛА
 ********************************************/
export const fileExists = (filePathFull: string): Promise<any> => fs.existsSync(filePathFull);

/********************************************
 * ЗАПИСАТЬ ПОТОК В ФАЙЛ ХРАНИЛКИ, СОЗДАТЬ НЕОБХОДИМЫЕ ПАПКИ
 * @param stream - поток, который нужно записать
 * @param filePath - полный путь с именем создаваемого файла
 * @param compress [FILE.VOLUME.COMPRESS_DEFAULT] - сжать перед сохранением
 * @param isThrow [true] - при ошибке бросить throw
 ********************************************/
export const writeFileVolume = async (args: {
  stream: Readable;
  filePath: string;
  compress?: boolean;
  isThrow?: boolean;
}): Promise<boolean> => {
  const { stream, filePath, compress = FILE.VOLUME.COMPRESS_DEFAULT, isThrow = true } = args;
  const pathOnly = path.dirname(filePath);
  // проверить наличие папок, при их отсутствии - создать
  return createPath(pathOnly)
    .then(() => {
      const streams = [stream];
      if (compress) streams.push(zlib.createGzip({ level: FILE.VOLUME.COMPRESS_LEVEL }));
      streams.push(fs.createWriteStream(filePath));
      const pipelineAsync = util.promisify(pipeline);
      return pipelineAsync(streams);
    })
    .then(() => true)
    .catch((err) => {
      wLogger.error(err);
      if (isThrow) throw "Ошибка записи файла";
      return false;
    });
};

/********************************************
 * ПРОЧИТАТЬ ФАЙЛ ХРАНИЛКИ В ПОТОК
 * @param filePath - полный путь с именем читаемого файла
 * @param compress [VOLUME.COMPRESS_DEFAULT] - распаковать после чтения
 * @param isThrow [true] - при ошибке бросить throw
 * @param isProxy [false] - для чтения сжатого файла использовать промежуточный файл
 ********************************************/
export const readFileVolume = async (args: {
  filePath: string;
  compress?: boolean;
  isThrow?: boolean;
  isProxy?: boolean;
  fileExtOrigin?: string;
}): Promise<Readable> => {
  const {
    filePath,
    compress = FILE.VOLUME.COMPRESS_DEFAULT,
    isThrow = true,
    isProxy = false,
    fileExtOrigin = FILE.VOLUME.EXT,
  } = args;
  try {
    // существует ли файл т.к. fs.createReadStream ошибку сразу не выдает
    if (!fs.existsSync(filePath)) customError("Файл не найден");
    const stream = fs.createReadStream(filePath, { flags: "r" });
    // return (compress) ? stream.pipe(zlib.createGunzip()) : stream;

    // при отстутствии сжатия - вернуть поток
    if (!compress) return stream;

    // если достаточно декодировать поток
    const gunzip = zlib.createGunzip();
    if (!isProxy) return stream.pipe(gunzip);

    // FIXME: иначе работаем через временный файл (вынужденный шаг)
    // очевидно, проблема при работе с потоками, потом разобраться

    stream.on("error", (err) => {
      wLogger.error(`error: ${err.message}`);
    });
    const pathOnly = path.join(process.env.FILE_STAGE, FILE.VOLUME.TEMP);
    await createPath(pathOnly);
    const fileTemp = path.join(pathOnly, uuidv4() + fileExtOrigin);
    const pipelineAsync = util.promisify(pipeline);
    await pipelineAsync([stream, gunzip, fs.createWriteStream(fileTemp)]);
    return await fs.createReadStream(fileTemp).on("end", () => {
      fs.unlink(fileTemp, (err) => err && wLogger.error(err));
    });
  } catch (err) {
    wLogger.error(err);
    if (isThrow) throw "Ошибка чтения файла";
  }
};

/********************************************
 * УДАЛИТЬ ФАЙЛ ХРАНИЛКИ
 * @param filePath - полный путь с именем файла
 * @param isThrow [true] - при ошибке бросить throw
 ********************************************/
export const deleteFileVolume = async (args: {
  filePath: string;
  isThrow?: boolean;
}): Promise<boolean> => {
  const { filePath, isThrow = true } = args;
  return fs.promises
    .unlink(filePath)
    .then(() => true)
    .catch((err) => {
      wLogger.error(err);
      if (isThrow) throw "Ошибка удаления файла";
      return false;
    });
};

/********************************************
 * УДАЛИТЬ ФАЙЛЫ ХРАНИЛКИ (СПИСКОМ)
 * @param filePathList - список: полный путь с именем файла
 * @param isThrow [true] - при ошибке бросить throw
 ********************************************/
export const deleteFileListVolume = async (args: {
  filePathList: string[];
  isThrow?: boolean;
}): Promise<boolean> => {
  const { filePathList, isThrow = true } = args;
  for (const filePath of filePathList) {
    await deleteFileVolume({ filePath, isThrow });
  }
  return true;
};
