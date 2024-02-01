import { Readable } from "stream";
import axios from "axios";
import FormData from "form-data";

import { FILE_FORMAT_PDF } from "../file.const";
import { SETTING_CONST } from "../../settings/settings.const";
import { wLogger } from "../../logger/logging.module";
import { getSettingsValInt, getSettingsValStr } from "../../settings/settings.util";


/********************************************
 * ОПРЕДЕЛИТЬ ФОРМАТ PDF ФАЙЛА
 * https://github.com/veraPDF/veraPDF-rest.git
 ********************************************/
export const getPdfFormat = async ({
  org,
  stream,
  format,
}: {
  org: string;
  stream: Readable;
  format: FILE_FORMAT_PDF;
}): Promise<boolean> => {
  const timeout = (getSettingsValInt({ org: org, key: SETTING_CONST.TIMEOUT_PDF_VERIFY.nm }) ?? 1000) * 1000;
  let url = getSettingsValStr({ org: org, key: SETTING_CONST.URL_PDF_VERIFY.nm })+'/api/validate/';
  switch (format) {
    case FILE_FORMAT_PDF.FILE_FORMAT_PDF_A1A:
      url += "1a";
      break;
    case FILE_FORMAT_PDF.FILE_FORMAT_PDF_A2A:
      url += "2a";
      break;
    case FILE_FORMAT_PDF.FILE_FORMAT_PDF_A1B:
      url += "1b";
      break;
    case FILE_FORMAT_PDF.FILE_FORMAT_PDF_A2B:
      url += "2b";
      break;
    default:
      return false;
  }

  const data = new FormData();
  data.append("file", stream);
  data.append("accept", "application/json");
  data.append("contentType", "multipart/form-data; boundary=");
  return (
    axios
      // запрос: создать
      .create({
        headers: data.getHeaders(),
        timeout,
      })

      // запрос: отправить
      .post(url, data)

      // результат
      .then((response) => {
        if (
          response?.data?.compliant ||
          response?.data?.report?.jobs[0]?.validationResult?.compliant
        )
          return true;
        return false;
      })

      // ошибка
      .catch((err) => {
        if (err?.response?.status == 500) return false;
        wLogger.error("err");
        throw err;
      })
  );
};
