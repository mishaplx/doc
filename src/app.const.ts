export const CRON = {
  /** АВТОРИЗАЦИЯ */
  AUTH: {
    SESSION: {
      MASK: "*/10 * * * * *",
      NAME: "execAuthSession",
    },
  },

  /** РАБОТА С ФАЙЛАМИ */
  FILE: {
    MAIN_CONTENT: {
      MASK: "*/14 * * * * *",
      NAME: "execFileMainContent",
    },
    PDF_FORMAT: {
      MASK: "*/15 * * * * *",
      NAME: "execFilePdfFormat",
    },
    PDF_CREATE: {
      MASK: "*/16 * * * * *",
      NAME: "execFilePdfCreate",
    },
    SYS: {
      MASK: "* */5 * * * *",
      NAME: "execFileSys",
    }
  },

  /** ПОЧТОВЫЙ ИМПОРТ */
  INCMAIL: {
    MASK: "0 0 * * */1 *",
    NAME: "importIncmail",
  },

  /** ПРОВЕРКА ЭЦП */
  SIGN: {
    MASK: "*/11 * * * * *",
    NAME: "execSignVerify",
  },

   /** СИНХРОНИЗАЦИЯ НАСТРОЕК */
  SETTINGS: {
    MASK: "0 */1 * * * *", // каждую минуту
    NAME: "syncSettings",
  },
};

/** константы цветов в консоли */
export const CONSOLE = {
  SEPARATOR: "*****************************************",
  COLOR: {
    uncolorize: (str: string): string => str.replace(/\x1B\[\d+m/gi, ""),

    RESET: "\x1b[0m",
    BRIGHT: "\x1b[1m",
    DIM: "\x1b[2m", // bold
    ITALIC: "\x1b[3m", // non-standard
    UNDERSCORE: "\x1b[4m",
    BLINK: "\x1b[5m",
    REVERSE: "\x1b[7m",
    HIDDEN: "\x1b[8m",

    FG: {
      BLACK: "\x1b[30m",
      RED: "\x1b[31m",
      GREEN: "\x1b[32m",
      YELLOW: "\x1b[33m",
      BLUE: "\x1b[34m",
      MAGENTA: "\x1b[35m",
      CYAN: "\x1b[36m",
      WHITE: "\x1b[37m",
      CRIMSON: "\x1b[38m",
    },

    BG: {
      BLACK: "\x1b[40m",
      RED: "\x1b[41m",
      GREEN: "\x1b[42m",
      YELLOW: "\x1b[43m",
      BLUE: "\x1b[44m",
      MAGENTA: "\x1b[45m",
      CYAN: "\x1b[46m",
      WHITE: "\x1b[47m",
      CRIMSON: "\x1b[48m",
    },
  },
};

export const LOGGER = {
  TITLE: 'dn2',
  FOLDER: 'log',
  FILE: {
    ERROR: '.error.log',
    COMBINED: '.combined.log',
    EXCEPT: '.exceptions.log',
    REJECT: '.rejections.log',
  },
};

