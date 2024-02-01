// import { createReadStream, ReadStream } from 'fs';
// const fs = require('node:fs');
// const pt = require('node:path');
// const util = require('node:util');
// const zlib = require('node:zlib');
// const { pipeline } = require('node:stream');

// /**
//  * ЗАПИСАТЬ ПОТОК В ФАЙЛ S3, СОЗДАТЬ НЕОБХОДИМЫЕ ПАПКИ
//  * @param stream - поток, который нужно записать
//  * @param filePath - полный путь с именем создаваемого файла
//  * @param compress [false] - сжать перед сохранением
//  * @param isThrow [true] - при ошибке бросить throw
//  */
// export const writeFileS3 = async (args: {
//   stream: ReadStream,
//   filePath: string,
//   compress?: boolean,
//   isThrow?: boolean,
// }): Promise<boolean> => {
//   const { stream, filePath, compress = false, isThrow = true } = args;
//   const pathOnly = pt.dirname(filePath);

//   // проверить наличие папок, при их отсутствии - создать
//   return fs.promises.access(pathOnly, fs.constants.R_OK | fs.constants.W_OK)
//   .catch(() => fs.mkdirSync(pathOnly, { recursive: true }))
//   .then(() => {
//     const streams = [stream];
//     if (compress) streams.push(zlib.createGzip());
//     streams.push(fs.createWriteStream(filePath));
//     const pipelineAsync = util.promisify(pipeline);
//     return pipelineAsync(streams);
//   })
//   .then(() => true)
//   .catch((err) => {
//     console.error(err);
//     if (isThrow) throw 'Ошибка записи файла';
//     return false;
//   });
// };

// /**
//  * ПРОЧИТАТЬ ФАЙЛ S3 В ПОТОК
//  * @param filePath - полный путь с именем читаемого файла
//  * @param compress [false] - сжать перед сохранением
//  * @param isThrow [true] - при ошибке бросить throw
//  */
// export const readFileS3 = async (args: {
//   filePath: string,
//   compress?: boolean,
//   isThrow?: boolean,
// }): Promise<ReadStream> => {
//   const { filePath, compress = false, isThrow = true } = args;
//   try {
// //   let s3Stream = S3Stream(new AWS.S3());
// //   let read = fs.createReadStream(filePath);
// //   let compress = zlib.createGzip();
// //   let upload = s3Stream.upload({
// //     Bucket: "static.smartystreets.com",
// //     Key: "sdk/" + version + "/" + fileName,
// //     StorageClass: "STANDARD",
// //     ContentType: "application/javascript",
// //     ContentEncoding: "gzip",
// //   });
// // read
// //     .pipe(compress)
// //     .pipe(upload);
//   } catch(err) {
//     console.error(err);
//     if (isThrow) throw 'Ошибка чтения файла';
//   }
// };
