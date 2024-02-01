import "dotenv/config";

import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { AuthApiService } from "src/auth/api/auth.api.service";
import Logger from "src/modules/logger/logger";
import { customError, setErrorRest } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { FILE } from "../file.const";
import { setBlockedFile, verifyBlockedFileOrFail } from "../utils/file.blocked.utils";
import { downloadFromFileFolder } from "../utils/file.download";
import { writeFileRest } from "../utils/file.rest.utils";
import { getPathVolume, readFileVolume } from "../utils/file.volume.utils";
import { UserSessionTypeEnum } from "src/auth/session/auth.session.const";
import { getSettingsValStr } from "src/modules/settings/settings.util";
import { SETTING_CONST } from "src/modules/settings/settings.const";

@Injectable()
export class FileDownloadService {
  private readonly fileItemRepository: Repository<FileItemEntity>;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(AuthApiService) private readonly authApiService: AuthApiService,
    private logger: Logger,
  ) {
    this.fileItemRepository = dataSource.getRepository(FileItemEntity);
  }

  /**
   * ОТДАТЬ ФАЙЛ НА ФРОНТ
   * @param(blockFileBlock) - заблокировать файловый блок для редактирования другими пользователями
   */
  async downloadFile(args: {
    token: IToken;
    idFileItem: number;
    blockFileBlock?: boolean;
    res: any;
    req: any;
  }): Promise<void> {
    const sendErr = (err) =>
      setErrorRest({
        msg: "Ошибка отправки файла с сервера",
        err: err,
        res: args.res,
      });
    try {
      if (!args.idFileItem) {
        customError("Не задан id файла");
      }
      const fileItemEntity = await this.fileItemRepository.findOneBy({ id: args.idFileItem });
      if (!fileItemEntity) {
        customError("Не найдена ссылка на файл в базе данных");
      }
      const fileVersionEntity = await fileItemEntity.FileVersion;
      const fileBlockEntity = await fileVersionEntity.FileBlock;

      // ========================================
      // установить блокировку файлового блока
      // ========================================
      if (args.blockFileBlock) {
        // проверить - заблокирован ли блок ранее
        await verifyBlockedFileOrFail({
          fileBlockEntity: fileBlockEntity,
          user_session_id: args.token.session_id,
        });

        // сгенерировать токен доступа
        const { token: newTokens, session: userSessionEntity } =
          await this.authApiService.authApiCreate({
            token: args.token,
            type_session: UserSessionTypeEnum.api_file_edit,
          });

        // записать токен в куки
        // args.res.set({ 'Token': newTokens });
        await args.res.cookie("Token", newTokens, {
          httpOnly: true,
          // domain: args.token.ip,
        });

        // пометить файловый блок как заблокированный
        await setBlockedFile({
          manager: this.dataSource.manager,
          file_block_id: fileBlockEntity.id,
          user_session_id: userSessionEntity.id,
        });
      }

      // ========================================
      // отдать файл
      // ========================================
      const org = this.dataSource.options.database as string; // context.req.headers.org.toLowerCase();
      const path = getPathVolume(org, fileItemEntity.date_create, fileItemEntity.volume);
      const stream = await readFileVolume({
        filePath: path,
        compress: fileItemEntity.compress,
      });
      stream.on("error", (err) => sendErr(err));
      await writeFileRest({
        res: args.res,
        stream: stream,
        fileName: fileVersionEntity.name + "." + fileItemEntity.ext,
      });
      await this.logger.logFileOperation(
        args.token,
        args.req,
        this.dataSource.manager,
        "download",
        fileItemEntity.id,
      );
    } catch (err) {
      sendErr(err);
    }
  }

  /**
   * CCS: GET VERSION
   */
  ccsVersion(args: { org: string }): string {
    return getSettingsValStr({
      org: args.org,
      key: SETTING_CONST.CCSLITE_VERSION.nm,
    });
  }

  /**
   * CCS: DOWNLOAD
   */
  async downloadCcs(args: { res: any }): Promise<void> {
    return await downloadFromFileFolder({
      res: args.res,
      fileName: FILE.DOWNLOAD.CCS,
    });
  }

  /**
   * TOOLS: DOWNLOAD
   */
  async downloadTools(args: { res: any }): Promise<void> {
    return await downloadFromFileFolder({
      res: args.res,
      fileName: FILE.DOWNLOAD.TOOLS,
    });
  }
}
