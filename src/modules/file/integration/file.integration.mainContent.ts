import axios from "axios";
import { Readable } from "stream";
import FormData from "form-data";

import { SETTING_CONST } from "../../settings/settings.const";
import { getSettingsValInt, getSettingsValStr } from "../../settings/settings.util";

const ERR = "Ошибка извлечения текста из файла";

/********************************************
 * ИЗВЛЕЧЬ ТЕКСТ ИЗ ФАЙЛА
 ********************************************/
export const getFileContent = async ({
  org,
  stream,
}: {
  org: string;
  stream: Readable,
}): Promise<string> => {
  const timeout = (getSettingsValInt({ org: org, key: SETTING_CONST.TIMEOUT_PDF_CREATE.nm }) ?? 1000) * 1000;
  const url = getSettingsValStr({ org: org, key: SETTING_CONST.URL_PDF_CREATE.nm })+'/text';
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

      .post(url, data)

      // ответ: вернуть содержимое буфера
      .then((response) => response?.data)
      .catch(() => null)
  );
};
