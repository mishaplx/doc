import { Readable } from "stream";
import axios from "axios";
import FormData from "form-data";

import { getSettingsValInt, getSettingsValStr } from "src/modules/settings/settings.util";
import { SETTING_CONST } from "src/modules/settings/settings.const";

export interface IVerifySign {
  valid: boolean;
  info?: string;
  error?: string;
}

// код успешной проверки ЭЦП
const SIGN_CODE_VALID = 0;

/********************************************
 * ПРОВЕРИТЬ ЭЦП
 ********************************************/
export const verifySign = async (args: {
  org: string;
  file: Readable;
  sign: string;
  show_info: boolean;
}): Promise<IVerifySign> => {
  const { org, file, sign, show_info } = args;
  const url = getSettingsValStr({ org: org, key: SETTING_CONST.URL_SIGN.nm })+'/sign/verify/';

    const data = new FormData();
  data.append("file", file);
  data.append("sign_str", sign);
  data.append("show_info", show_info.toString());
  data.append("accept", "application/xml");
  data.append("contentType", "multipart/form-data; boundary=");

  return axios
    .create({
      headers: data.getHeaders(),
      timeout:
        getSettingsValInt({
          org: org,
          key: SETTING_CONST.TIMEOUT_SIGN.nm,
        }) * 1000,
    })
    .post(url, data)
    .then((response) => {
      const data = response?.data;
      const code = data?.code ?? -1;
      const ret = {
        valid: code == SIGN_CODE_VALID,
      };
      if (code != SIGN_CODE_VALID) ret["error"] = data?.message ?? "Неизвестная ошибка";
      if (data?.info) ret["info"] = data?.info ?? "";
      return ret;
    });
};
