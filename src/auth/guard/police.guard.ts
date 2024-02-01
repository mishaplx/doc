import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, Repository } from "typeorm";

import { DocStatus } from "../../modules/doc/doc.const";
import { PREF_ERR } from "../../common/enum/enum";
import { OperationType } from "./role.enum";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../entity/#organization/file/fileItem.entity";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { getAccessOperation } from "./guard.utils";

@Injectable()
export class PoliceGuard implements CanActivate {
  private readonly dataSource: DataSource;
  private readonly userRepository: Repository<UserEntity>;
  private readonly OperationRepository: Repository<OperationEntity>;
  private readonly EmpRepository: Repository<EmpEntity>;
  private readonly RoleRepository: Repository<RolesEntity>;
  private readonly docRepository: Repository<DocEntity>;
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly fileItemRepository: Repository<FileItemEntity>;
  private readonly staffRepository: Repository<StaffEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.userRepository = dataSource.getRepository(UserEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
    this.OperationRepository = dataSource.getRepository(OperationEntity);
    this.EmpRepository = dataSource.getRepository(EmpEntity);
    this.RoleRepository = dataSource.getRepository(RolesEntity);
    this.staffRepository = dataSource.getRepository(StaffEntity);
    this.fileItemRepository = dataSource.getRepository(FileItemEntity);
    // this.fileRepository = dataSource.getRepository(FileEntity);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // return true; //  заглушка на роли
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const args = ctx.getArgs();
    const [request, res, next] = context.getArgs();

    let mainOperation = ctx.getHandler().name;
    console.log("operation from USER-----", mainOperation, "-----operation from USER");
    const token = req?.get("Authorization")?.replace("Bearer", "").trim();
    const payload: IToken = new JwtService().decode(token)["payload"];

    // получить список доступных операций
    const access_operation = await getAccessOperation({
      dataSource: this.dataSource,
      emp_id: payload.current_emp_id,
    });

    //Проверка на супер админа
    if (access_operation.admin) {
      return true;
    }

    /**
Проверка операций с документами
\\\\--------------------------------------------------------------------------\\\\
 */
    if (ctx.getHandler().name.toLowerCase() == "getAllDoc".toLowerCase()) {
      mainOperation = this.checkgetAllDoc(args);
      if (typeof mainOperation == "boolean") {
        return true;
      }
    }

    if (ctx.getHandler().name.toLowerCase() == "listFileBlock".toLowerCase()) {
      mainOperation = await this.checkViewFileList(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "CreateDoc".toLowerCase()) {
      mainOperation = this.checkDocCls(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "findByIdDoc".toLowerCase()) {
      mainOperation = await this.checkgetDocByID(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "updateDoc".toLowerCase()) {
      mainOperation = await this.checkUpdateDoc(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "addReceiver".toLowerCase()) {
      mainOperation = await this.addReceiver(req.body);
    }
    if (ctx.getHandler().name.toLowerCase() == "endWorkDoc".toLowerCase()) {
      mainOperation = await this.endWorkDoc(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "sendDocToDocPackage".toLowerCase()) {
      mainOperation = await this.checkSendTOPackage(args);
    }

    // parse a file upload

    /**
\\\\--------------------------------------------------------------------------\\\\
 */

    /**
     Проверка операций с поручениями
     \\\\--------------------------------------------------------------------------\\\\
     */

    /**
     \\\\--------------------------------------------------------------------------\\\\
     */

    /**
     Проверка операций с файлами
     \\\\--------------------------------------------------------------------------\\\\
     */
    if (!(typeof request?.originalUrl == "undefined")) {
      if (request.originalUrl == "/download/tools" || request.originalUrl == "/download/ccs") {
        return true;
      }
      if (request.originalUrl == "/download/file") {
        mainOperation = await this.checkRouteDownloadFile(request);
      }
      if (request.originalUrl == "/audit/hash") {
        mainOperation = OperationType.Audit["checkhesh"];
      }

      if (request.originalUrl == "/audit/download/file") {
        return true;
      }
      if (request.originalUrl == "/upload/project-template") {
        return true;
      }

      if (request.originalUrl == "/report/doc") {
        if (access_operation.accessOperation.find((el) => el === OperationType.DownloadRKK)) {
          return true;
        }
        mainOperation = await this.checkRoutereport(request);
      }
      if (request.originalUrl == "/upload/file") {
        return true;
        // mainOperation = 'undefined';
        // //mainOperation = this.checkUploadFile(request);
      }
      if (request.originalUrl == "/download/file") {
        return true;
        // mainOperation = 'undefined';
        // //mainOperation = this.checkUploadFile(request);
      }
      if (request.originalUrl == "/update/file") {
        return true;
      }
    }
    /**
     Проверка операций с проектами
     \\\\--------------------------------------------------------------------------\\\\
     */
    if (ctx.getHandler().name.toLowerCase() == "getAllExecInStageProject".toLowerCase()) {
      mainOperation = await this.checkListStage(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "updateProject".toLowerCase()) {
      mainOperation = await this.updateProject(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "deleteExecInStageProject".toLowerCase()) {
      mainOperation = this.checkDeleteExec();
    }

    if (ctx.getHandler().name.toLowerCase() == "stageWithConfirm".toLowerCase()) {
      mainOperation = this.checkStageWithConfirm(args);
    }
    if (ctx.getHandler().name.toLowerCase() == "reportStatCreate".toLowerCase()) {
      mainOperation = this.reportStatCreate(args);
    }
    // общедоступная операция
    if (ctx.getHandler().name.toLowerCase() == "checkDublicateDocRedistrate".toLowerCase()) {
      return true;
    }
    if (ctx.getHandler().name.toLowerCase() == "getJobLoopMonthVariants".toLowerCase()) {
      return true;
    }

    if (ctx.getHandler().name.toLowerCase() == "getAllGroup".toLowerCase()) {
      return true;
    }

    /**
     \\\\--------------------------------------------------------------------------\\\\
     */

    /**
     \\\\--------------------------------------------------------------------------\\\\
     */

    const checkRole = await this.checkRoleForGQL(mainOperation, access_operation.accessOperation);
    //
    if (!checkRole) {
      throw new ForbiddenException(PREF_ERR + "нет доступа к данной операции");
    }
    return checkRole;
  }
  async checkRoleForGQL(mainOperation: string, access_operation: string[]) {
    return access_operation.some((item) => {
      return item === mainOperation;
    });
  }
  checkDocCls(args) {
    return OperationType.CreateDoc[args.cls];
  }
  async checkViewFileList(args) {
    if (args?.idDoc) {
      const { cls_id } = await this.docRepository.findOne({
        where: {
          id: args?.idDoc,
        },
      });
      return OperationType.ViewFile[cls_id];
    }
    if (args?.idJob) {
      return OperationType.ViewFile["4"];
    }
    if (args?.idProject) {
      return OperationType.ViewFile["5"];
    }
    if (args?.idIncmail) {
      return OperationType.ViewFile["6"];
    }
  }
  checkgetAllDoc(args) {
    if (args?.docstatus == DocStatus.INWORK.id) {
      return OperationType.getAllDocInDo;
    }

    if (args.cls == 0) return true;
    if (Array.isArray(args.id)) return true;
    return OperationType.GetAllDoc[args.cls];
  }

  async addReceiver(args) {
    const { cls_id } = await this.docRepository.findOne({
      where: {
        id: args.variables.id,
      },
    });
    return OperationType.AddReceiver[cls_id];
  }
  async checkSendTOPackage(args) {
    const { cls_id } = await this.docRepository.findOne({
      where: {
        id: args.docId,
      },
    });
    return OperationType.sendToPackage[cls_id];
  }
  async endWorkDoc(args) {
    const { cls_id } = await this.docRepository.findOne({
      select: {
        id: true,
        cls_id: true,
      },
      where: {
        id: args.id,
      },
    });
    return OperationType.endWork[cls_id];
  }
  async checkUpdateDoc(args) {
    const { cls_id } = await this.docRepository.findOne({
      select: {
        id: true,
        cls_id: true,
      },
      where: {
        id: Number(args.input.id),
      },
    });
    if (args.flagButton == 1) {
      return OperationType.SaveDoc[cls_id];
    }
    if (args.flagButton == 2) {
      return OperationType.RegistrateDoc[cls_id];
    }
    if (args.input.del) {
      return OperationType.DeleteItem[cls_id];
    }
  }
  async checkgetDocByID(args) {
    const idDoc = args.id;
    const { cls_id } = await this.docRepository.findOne({
      select: {
        id: true,
        cls_id: true,
      },
      where: {
        id: idDoc,
      },
    });

    return OperationType.findDoc[cls_id];
  }
  async checkRoutereport(request) {
    const { cls_id } = await this.docRepository.findOne({
      where: {
        id: Number(request.body.doc_id),
      },
    });
    return this.checkReportDocFile(cls_id) === true ? true : this.checkReportDocFile(cls_id);
  }
  async checkRouteDownloadFile(request) {
    const fileItem = await this.fileItemRepository.findOne({
      where: {
        id: request.body.idFileItem,
      },
      relations: {
        FileVersion: {
          FileBlock: true,
        },
      },
    });
    const fileVersion = await fileItem.FileVersion;
    const fileBlock = await fileVersion.FileBlock;
    if (fileBlock.doc_id) {
      const { cls_id } = await this.docRepository.findOne({
        where: {
          id: fileBlock.doc_id,
        },
      });
      return OperationType.DownloadFile[cls_id];
    }
    if (fileBlock.project_id) {
      return OperationType.DownloadFile[5];
    }
    if (fileBlock.job_id) {
      return OperationType.DownloadFile[4];
    }
  }

  checkReportDocFile(cls) {
    return OperationType.DownloadDocument[cls];
  }
  checkdownloadRKK() {
    return OperationType.DownloadDocument;
  }
  checkListStage(args) {
    return OperationType.ListStage[args.stage_id];
  }
  updateProject(args) {
    return OperationType.updateProject[args.flagButton];
  }
  checkDeleteExec() {
    return OperationType.updateProject["3"];
  }
  checkStageWithConfirm(args) {
    return OperationType.stageWithConfirm[args.id_stage];
  }
  reportStatCreate(args) {
    return OperationType.reportStatCreate;
  }
}
