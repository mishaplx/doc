import { Body, Controller, Delete, Get, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { Context } from "@nestjs/graphql";
import { JWTGuardForFile } from "../auth/guard/file.guard";
import { SmdoService } from "./smdo.service";

@Controller("smdo")
@UseGuards(JWTGuardForFile)
export class SmdoController {
  constructor(private readonly smdoServ: SmdoService) {}

  /** создать пакет */
  @Post("create-package")
  async createPackage(@Body() body): Promise<any> {
    return await this.smdoServ.createPackage(body?.abonentId, body?.docId, body?.addDocuments);
  }

  /** создать пакет */
  @Post("create-package-and-send")
  async createAndSendPackage(@Res() res, @Body() body, @Context() context): Promise<any> {
    const x = await this.smdoServ.createAndSendPackage(
      body?.corrIds,
      body?.documentId,
      body?.addDocuments,
      body?.files,
      context,
    );
    res.status(200).send(x);
  }

  /** удалить пакет */
  @Delete("delete-package")
  async deletePackage(@Query() query): Promise<any> {
    return await this.smdoServ.deletePackage(query?.packageId);
  }

  /** прикрупить файл к пакету */
  @Post("attach-file-to-package")
  async attachFileToPackage(@Res() res, @Body() body, @Context() context): Promise<any> {
    const x = await this.smdoServ.attachFileToPackage(
      body?.packageId,
      body?.fileId,
      body?.addDocuments,
      context,
    );
    res.send(x);
  }

  /** удалить файл из пакета */
  @Delete("delete-file-from-package")
  async deleteFileFromPackage(@Query() query): Promise<any> {
    return await this.smdoServ.deleteFileFromPackage(query?.packageId, query?.attachId);
  }

  /** подписать ЭЦП файл в пакете */
  @Put("sign-attachment-in-package")
  async signAttachmentInPackage(@Body() body): Promise<any> {
    return await this.smdoServ.signAttachmentInPackage(body?.packageId, body?.attachId, body?.data);
  }

  /** отменить ЭЦП файла в пакете */
  @Delete("unsign-attachment-in-package")
  async unsignAttachmentInPackage(@Query() query): Promise<any> {
    return await this.smdoServ.unsignAttachmentInPackage(query?.packageId, query?.attachId);
  }

  /** отправить пакет на обработку */
  @Get("send-package")
  async sendPackage(@Query() query): Promise<any> {
    return await this.smdoServ.sendPackage(query?.packageId);
  }

  /** проверить соединение */
  @Get("check-connection")
  async checkConnection(): Promise<any> {
    return await this.smdoServ.checkToken();
  }

  /** получить список пакетов */
  @Get("get-package-list")
  async getPackageList(): Promise<any> {
    return await this.smdoServ.getPackageList();
  }

  /** получить вложение пакета */
  @Get("get-package-attachment")
  async getPackageAttachment(@Query() query): Promise<any> {
    return await this.smdoServ.getPackageAttachment(query?.packageId, query?.attachId);
  }

  /** подтвердить получение одного пакета */
  @Get("confirm-one-package-receiving")
  async confirmOnePackageReceiving(@Query() query): Promise<any> {
    return await this.smdoServ.confirmOnePackageReceiving(query?.confirmId);
  }

  /** подтвердить получение нескольких пакетов */
  @Post("confirm-many-package-receiving")
  async confirmManyPackageReceiving(@Body() body): Promise<any> {
    return await this.smdoServ.confirmManyPackageReceiving(body?.ids);
  }

  /** обновить справочник */
  @Get("update-info")
  async updateSmdoInfo(@Query() query): Promise<any> {
    return await this.smdoServ.updateSmdoInfo(query?.name);
  }
}
