import { parentPort, workerData } from "worker_threads";

import { LOGGER } from "../../../app.const";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";
import { setSettings } from "../../settings/settings.util";
import { initWinston, wLogger } from "../../logger/logging.module";
import { createPdfLogic } from "./pdfCreateLogic";

export interface FileDataWorker {
  org: string;
  fileVersionEntity: FileVersionEntity;
  url: string;
  timeout: string;
}

const fileWorkerData: FileDataWorker = workerData;

/**
 * ЗАПУСКАЕТСЯ В ОТДЕЛЬНОМ ПОТОКЕ
 */
async function createPdfWorker(): Promise<void> {
  let result = false;

  // инициализация
  initWinston(LOGGER.TITLE);

  // установить настройки
  await setSettings();

  try {
    result = await createPdfLogic(fileWorkerData);
  } catch {
    wLogger.info("Worker error");
  }
  parentPort.postMessage(result);
}

createPdfWorker();
