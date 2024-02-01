export enum FILE_FORMAT_PDF {
  // FILE_FORMAT_PDF_UNDEFINED = 'PDF/?',
  FILE_FORMAT_PDF_A1A = "PDF/A-1a",
  FILE_FORMAT_PDF_A2A = "PDF/A-2a",
  FILE_FORMAT_PDF_A1B = "PDF/A-1b",
  FILE_FORMAT_PDF_A2B = "PDF/A-2b",
}

export const FILE = {
  CONTENT: {
    /** Отсутствие контента - ошибка */
    ERR_EMPTY: true,
  },
  FORMAT: {
    /** ФОРМАТЫ ДЛЯ АРХИВА */
    ARJ: [
      FILE_FORMAT_PDF.FILE_FORMAT_PDF_A1A,
      FILE_FORMAT_PDF.FILE_FORMAT_PDF_A1B,
      FILE_FORMAT_PDF.FILE_FORMAT_PDF_A2A,
      FILE_FORMAT_PDF.FILE_FORMAT_PDF_A2B,
    ],
  },

  /** ФАЙЛОВОЕ ХРАНИЛИЩЕ */
  VOLUME: {
    /** ПАПКА ДЛЯ ВРЕМЕННЫХ ФЙЛОВ */
    TEMP: "temp",
    /** РАСШИРЕНИЕ ФАЙЛОВ */
    EXT: ".dat",
    /** СЖАТИЕ ПО УМОЛЧАНИЮ */
    COMPRESS_DEFAULT: true,
    /** СТЕПЕНЬ СЖАТИЯ */
    COMPRESS_LEVEL: 9,
  },

  /** БАЗА ДАННЫХ */
  DB: {
    /** КОНВЕРТАЦИЯ В PDF ПО УМОЛЧАНИЮ */
    PDF_CREATE_DEFAULT: true,
  },

  /** ЗАГРУЗКИ */
  DOWNLOAD: {
    PATH: "src/file/download/",
    TOOLS: "DocnodeTools.exe",
    CCS: "itCCS_lite.msi",
  },
};
