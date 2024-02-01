import { ILike } from "typeorm";

import { CONSOLE } from "src/app.const";
import { getDataSourceAdmin, getOrgList } from "src/database/datasource/tenancy/tenancy.utils";
import { SettingEntity } from "src/entity/#organization/setting/setting.entity";

import { IWhereFindAllSystemSettings } from "../../common/interfaces/systemsettings.interface";
import { GetSystemSettingsArgs } from "./dto/get-systemsettings.args";
import { wLogger } from "../logger/logging.module";
import { TSettingConstNm } from "./settings.const";


/**
 * установить глобальные настройки для БД org
 */
export const setSettings = async (): Promise<void> => {
  const orgList = await getOrgList();
  for (const org of orgList) {
    try {
      const dataSource = await getDataSourceAdmin(org);

      if (!global.settings) global.settings = {};
      if (!global.settings[org]) global.settings[org] = {};

      const variables = await dataSource.manager.findBy(SettingEntity, { del: false });
      for (const variable of variables) {
        global.settings[org][variable.name] = variable?.value;
      }
    } catch (e) {
      wLogger.error(
        CONSOLE.COLOR.FG.RED +
        `База данных: ${org}: ошибка глобальных настроек.` +
        CONSOLE.COLOR.RESET,
      );
    }
  }
};

/**
 * прочитать список глобальных настроек для БД org
 */
export const getSettingsList = (args: {
  org: string;
  keys: string[];
}): Record<string, string> => {
  const { org, keys } = args;

  // читать настройки
  const ret: Record<string, string> = {};
  const data = global.settings?.[org];
  for (const key of keys) {
    ret[key] = data?.[key];
  }
  return ret;
};


/**
 * корректно прочитать настройку (number)
 */
export const getSettingsValInt = (args: {
  org: string;
  key: TSettingConstNm;
}): number => {
  return Number(global.settings?.[args.org]?.[args.key]);
};

/**
 * корректно прочитать настройку (string)
 */
export const getSettingsValStr = (args: {
  org: string;
  key: TSettingConstNm;
}): string => {
  return (global.settings?.[args.org]?.[args.key] as string)?.trim();
};

/**
 * корректно прочитать настройку (url)
 */
export const getSettingsValUrl = (args: {
  org: string;
  key: TSettingConstNm;
}): URL => new URL(getSettingsValStr(args));

/**
 * корректно прочитать настройку (bool)
 */
export const getSettingsValBool = (args: {
  org: string;
  key: TSettingConstNm;
}): boolean => {
  const ret = global.settings?.[args.org]?.[args.key] as string;
  return ["true", "да", "+"].includes(ret?.trim()?.toLowerCase());
};

export function getWhereFindAllSystemSettings(
  args: GetSystemSettingsArgs,
): IWhereFindAllSystemSettings {
  const where: IWhereFindAllSystemSettings = {};
  const { description, value, smd, common, extra } = args;

  if (description) {
    where.description = ILike(`%${description}%`);
  }

  if (value) {
    where.value = ILike(`%${value}%`);
  }
  if (smd) {
    where.smd = true;
  }
  if (common) {
    where.common = true;
  }
  if (extra) {
    where.extra = true;
  }

  return where;
}
