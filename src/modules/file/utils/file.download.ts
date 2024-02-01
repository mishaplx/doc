import { setErrorRest } from "../../../common/type/errorHelper.type";
import { FILE } from "../file.const";
import { writeFileRest } from "./file.rest.utils";
import { readFileVolume } from "./file.volume.utils";

const path = require("path");

export const downloadFromFileFolder = async (args: {
  res: any;
  fileName: string;
}): Promise<void> => {
  const sendErr = (err) =>
    setErrorRest({
      msg: "Ошибка отправки файла с сервера",
      err: err,
      res: args.res,
    });
  try {
    const filePath = path.join(FILE.DOWNLOAD.PATH, args.fileName);
    const stream = await readFileVolume({
      filePath: filePath,
      compress: false,
    });
    await writeFileRest({
      res: args.res,
      stream: stream,
      fileName: args.fileName,
    });
  } catch (err) {
    sendErr(err);
  }
};
