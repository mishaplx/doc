import { SETTING_CONST } from "src/modules/settings/settings.const";
import { DataSource } from "typeorm";
import { customError } from "../../../common/type/errorHelper.type";
import { getSettingsList } from "../../settings/settings.util";

const MAIL_HOST = SETTING_CONST.INCMAIL_HOST.nm;
const MAIL_EMAIL = SETTING_CONST.INCMAIL_EMAIL.nm;
const MAIL_PASS = SETTING_CONST.INCMAIL_PASS.nm;

export const getAuthIncmail = (
  org: string,
): {
  host_list: string[];
  email_list: string[];
  pass_list: string[];
} => {
  const data: Record<string, string> = getSettingsList({
    org: org,
    keys: [MAIL_HOST, MAIL_EMAIL, MAIL_PASS],
  });

  const ret = {
    host_list: data[MAIL_HOST]?.split("|"),
    email_list: data[MAIL_EMAIL]?.split("|"),
    pass_list: data[MAIL_PASS]?.split("|"),
  };

  if (
    !ret.host_list[0] ||
    !ret.email_list[0] ||
    !ret.pass_list[0] ||
    ret.host_list.length != ret.email_list.length ||
    ret.email_list.length != ret.pass_list.length
  ) {
    customError("Не заданы хост, логин или пароль почты");
  }

  return ret;
};
