import { Readable } from "stream";
import axios from "axios";
import FormData from "form-data";

import { SETTING_CONST } from "../../settings/settings.const";
import { getSettingsValInt, getSettingsValStr } from "../../settings/settings.util";

/********************************************
 * СОЗДАТЬ PDF ФАЙЛ (ИЗ ПОТОКА В БУФЕР)
 * https://github.com/alphakevin/unoconv-server
 ********************************************/
export const createPdf = async ({
  org,
  stream,
}: {
  org: string;
  stream: Readable;
}): Promise<Buffer> => {
  const timeout = (getSettingsValInt({ org: org, key: SETTING_CONST.TIMEOUT_PDF_CREATE.nm }) ?? 1000) * 1000;
  const url = getSettingsValStr({ org: org, key: SETTING_CONST.URL_PDF_CREATE.nm }) + '/convert';

  const data = new FormData();
  data.append("file", stream);
  data.append("contentType", "multipart/form-data; boundary=");

  return (
    axios
      // запрос: создать
      .create({
        headers: data.getHeaders(),
        maxBodyLength: Infinity,
        responseType: "arraybuffer",
        timeout,
      })

      // запрос: отправить
      .post(url, data)

      // ответ: вернуть содержимое буфера
      .then((response) => response?.data)
  );
};
