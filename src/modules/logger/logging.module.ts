import path from "path";
import winston, { Logger } from "winston";
import "winston-daily-rotate-file";

import { LOGGER } from "../../app.const";

export const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export let wLogger: Logger | undefined = undefined;
export const initWinston = (apiTitle: string): winston.Logger => {
  const LOG_FILE_SET = {
    datePattern: 'YYYY-MM-DD',
    // zippedArchive: true,
    // maxSize: '20m',
    maxFiles: (process.env.LOGGER_STORAGE ?? '31')+'d',
  } as const;
  const logger = winston.createLogger({
    level: "debug",
    levels: logLevels,
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: apiTitle },
    transports: [
      new winston.transports.DailyRotateFile({
        ...LOG_FILE_SET,
        filename: path.join(LOGGER.FOLDER, '%DATE%'+LOGGER.FILE.ERROR),
        level: "error",
      }),
      new winston.transports.DailyRotateFile({
        ...LOG_FILE_SET,
        filename: path.join(LOGGER.FOLDER, '%DATE%'+LOGGER.FILE.COMBINED),
      }),
    ],
    exceptionHandlers: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      new winston.transports.DailyRotateFile({
        ...LOG_FILE_SET,
        filename: path.join(LOGGER.FOLDER, '%DATE%'+LOGGER.FILE.EXCEPT),
      }),
    ],
    rejectionHandlers: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      new winston.transports.DailyRotateFile({
        ...LOG_FILE_SET,
        filename: path.join(LOGGER.FOLDER, '%DATE%'+LOGGER.FILE.REJECT),
      }),
    ],
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }

  wLogger = logger;
  return logger;
};
