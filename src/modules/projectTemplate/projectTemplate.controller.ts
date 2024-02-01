import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { plainToClass } from "class-transformer";
import { Token } from "../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../auth/guard/file.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ProjectTemplateEntity } from "../../entity/#organization/project_template/project_template.entity";
import { FileUploadService } from "../file/fileUpload/fileUpload.service";
import { projectTemplateCreateDto } from "./dto/projectTemplateCreate.dto";
import { ProjectTemplateService } from "./projectTemplate.service";

@UseGuards(JWTGuardForFile, PoliceGuard)
@Controller("upload")
export class ProjectTemplateController {
  constructor(
    private readonly uploadService: FileUploadService,
    private readonly projectTemplateService: ProjectTemplateService,
  ) {}

  /** загрузить файл */
  @Post("project-template")
  @UseInterceptors(FilesInterceptor("files"))
  async uploadFile(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>, // @UploadedFile() file,
    @Token() token: IToken,
    @Res() res,
    @Req() req,
  ): Promise<ProjectTemplateEntity> {
    body = plainToClass(projectTemplateCreateDto, body, {});
    const file = await this.uploadService.uploadFile(
      {
        files: files,
        param: body,
        token: token,
        res: res,
        req: req
      },
      false,
    );
    const fileId = file[0]?.id;
    const template = await this.projectTemplateService.addProjectTemplate(
      body.nm,
      fileId,
      body.tdoc,
    );
    return res.status(200).send(template);
  }
}
