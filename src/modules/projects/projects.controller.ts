import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { plainToClass } from "class-transformer";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../auth/guard/file.guard";
import { projectsStageRemarkDto } from "./projects.dto";
import { ProjectsService } from "./projects.service";
import { IBodyRevision } from "./type/project.interface";

@Controller("projects")
@UseGuards(JWTGuardForFile)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /********************************************
   * ПОДПИСАТЬ, ВИЗИРВОАТЬ, УТВЕРДИТЬ: С ЗАМЕЧАНИЯМИ
   ********************************************/
  @Post("remark")
  @UseInterceptors(FilesInterceptor("file"))
  async stageWithRemark(
    @Token() token: IToken,
    @Body() body: any,
    @UploadedFiles() file: Express.Multer.File[],
    @Res() res,
  ): Promise<any> {
    body = plainToClass(projectsStageRemarkDto, body, {});
    return await this.projectsService.stageWithRemark({
      file: file,
      id_project: body.idProject,
      id_stage: body.idStage,
      remark: body.remark,
      token: token,
      res: res,
    });
  }

  /********************************************
   * ПОДПИСАТЬ, ВИЗИРВОАТЬ, УТВЕРДИТЬ: НА ДОРАБОТКУ
   ********************************************/
  @Post("revision")
  @UseInterceptors(FilesInterceptor("file"))
  async stageWithRevision(
    @Token() token: IToken,
    @Body() body: IBodyRevision,
    @UploadedFiles() file: Express.Multer.File[],
    @Res() res,
  ): Promise<any> {
    body = plainToClass(projectsStageRemarkDto, body, {});
    const response = await this.projectsService.stageWithRevision({
      file: file[0],
      id_project: body.idProject,
      id_stage: body.idStage,
      remark: body.remark,
      token: token,
      res: res,
    });

    res.send(response);
  }
}
