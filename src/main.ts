import fs from "node:fs";
import path from "node:path";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { CONSOLE, LOGGER } from "./app.const";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filter/HttpException.filter";
import { LoggingInterceptor } from "./interceptor/logging.interceptor";
import { FILE } from "./modules/file/file.const";
import { initWinston, wLogger } from "./modules/logger/logging.module";
import { setSettings } from "./modules/settings/settings.util";

async function bootstrap(): Promise<void> {
  process.env.TZ = "Europe/Minsk";

  initWinston(LOGGER.TITLE);
  wLogger.info('Приложение: запуск');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle("REST API - docnode2")
    .setDescription("REST API description")
    .setVersion("1.0")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "JWT",
      description: "Enter JWT token",
      in: "header",
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  app.disable("x-powered-by"); // отключаем ненужный заголовок
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.API_PORT || 3005;
  await app.listen(port, () => {
    console.log(
      "🚀" + CONSOLE.SEPARATOR + "🚀",
      "\n" +
        "link     " +
        CONSOLE.COLOR.FG.CYAN +
        `http://localhost:${port}\n` +
        CONSOLE.COLOR.RESET +
        "graphql  " +
        CONSOLE.COLOR.FG.CYAN +
        `http://localhost:${port}/graphql\n` +
        CONSOLE.COLOR.RESET +
        "swagger  " +
        CONSOLE.COLOR.FG.CYAN +
        `http://localhost:${port}/api\n` +
        CONSOLE.COLOR.RESET +
        "cron     " +
        (process.env.DISABLED_CRON === "true"
          ? CONSOLE.COLOR.FG.RED + "ОТКЛ"
          : CONSOLE.COLOR.FG.GREEN + "ВКЛ") +
          CONSOLE.COLOR.RESET +
        "\n" +
        CONSOLE.COLOR.RESET +
        "🚀" +
        CONSOLE.SEPARATOR +
        "🚀",
      "",
    );
  });

  // установить настройки
  await setSettings();

  // очистить временнную папку
  fs.rmSync(path.join(process.env.FILE_STAGE, FILE.VOLUME.TEMP), {
    recursive: true,
    force: true,
  });
}
bootstrap();
