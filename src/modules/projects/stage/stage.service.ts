import { HttpException, HttpStatus, Inject } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PREF_ERR } from "../../../common/enum/enum";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../../entity/#organization/emp/emp.entity";
import { ExecInprojectRouteEntity } from "../../../entity/#organization/project/execInprojectRoute.entity";
import { ProjectEntity } from "../../../entity/#organization/project/project.entity";
import { wLogger } from "../../logger/logging.module";
import { AddExectDto, UpdateExecProjectDto } from "../dto/stage/addExec.dto";
import { ProjectExecService } from "../projects.exec.service";
import { checkQueue } from "../utils/project.utils";
import { ProjectStatus, projectMessageErr } from "../projects.const";

export class StageService {
  private readonly projectsRepository: Repository<ProjectEntity>;
  private readonly EmpRepository: Repository<EmpEntity>;
  private readonly ExecInprojectRouteEntity: Repository<ExecInprojectRouteEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource, private projectsUtils: ProjectExecService) {
    this.projectsRepository = dataSource.getRepository(ProjectEntity);
    this.EmpRepository = dataSource.getRepository(EmpEntity);
    this.ExecInprojectRouteEntity = dataSource.getRepository(ExecInprojectRouteEntity);
  }

  async addExecInStageProject(
    AddExectDto: AddExectDto,
    res,
    token: IToken,
  ): Promise<ExecInprojectRouteEntity[] | HttpException> {
    const execIncurrentStage = await this.ExecInprojectRouteEntity.findOne({
      where: {
        project_id: AddExectDto.project_id,
        stage_id: AddExectDto.stage_id,
        executor_id: token.current_emp_id,
      },
    });
    const project = await this.projectsRepository.findOne({
      where: {
        id: AddExectDto.project_id,
      },
    });
    if (project.status_id === ProjectStatus.INWORK) {
      const checkQeueVal = await checkQueue({
        manager: this.dataSource.manager,
        project_id: project.id,
        emp_id: token.current_emp_id,
        stage_id: project.current_stage_id,
      });
      if (checkQeueVal) {
        customError(projectMessageErr.MessQueue);
      }
      if (execIncurrentStage.queue > AddExectDto.queue) {
        customError(
          projectMessageErr.ErrorQueue.replace("NUMBER_VALUE", String(execIncurrentStage.queue)),
        );
      }
    }

    for (const executor of AddExectDto.executor_id) {
      const checkUniqueExecInStage = await this.projectsUtils.checkUniqueExecInStage(
        AddExectDto.project_id,
        AddExectDto.stage_id,
        executor,
      );

      if (checkUniqueExecInStage) {
        return new HttpException(
          `${PREF_ERR} Пользователь уже принимает участие в проекте`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const checkAccessAddExec = await this.projectsUtils.checkAccessAddExec(
        AddExectDto.project_id,
        AddExectDto.stage_id,
        token.current_emp_id,
      );

      if (checkAccessAddExec) {
        return new HttpException(
          `${PREF_ERR} Вы не можете добавить исполнителя на этап`,
          HttpStatus.BAD_REQUEST,
        );
      }

      AddExectDto.temp = false;

      await this.ExecInprojectRouteEntity.query(
        `
          INSERT INTO sad.exec_in_project_route (del, temp, project_id, queue, stage_id, date_plan, note, executor_id, parent_exec_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9)`,
        [
          false,
          false,
          AddExectDto.project_id,
          AddExectDto.queue,
          AddExectDto.stage_id,
          new Date(AddExectDto.date_plan).toUTCString(),
          AddExectDto.note,
          executor,
          token.current_emp_id,
        ],
      );
    }

    return await this.ExecInprojectRouteEntity.find({
      where: {
        project_id: AddExectDto.project_id,
        stage_id: AddExectDto.stage_id,
      },
    });
  }

  async getAllExecInStageProject(
    project_id,
    stage_id,
  ): Promise<ExecInprojectRouteEntity[] | HttpException> {
    return await this.ExecInprojectRouteEntity.find({
      relations: {
        FileBlock: true,
      },
      where: {
        project_id: project_id,
        stage_id: stage_id,
      },
      order: {
        queue: "ASC",
      },
    });
  }
  async deleteExecInStageProject(
    project_id,
    executor_id,
    token: IToken,
  ): Promise<boolean | HttpException> {
    try {
      const project = await this.projectsRepository.findOne({
        where: {
          id: project_id,
        },
      });
      if (project.status_id === ProjectStatus.INWORK) {
        const checkQeueVal = await checkQueue({
          manager: this.dataSource.manager,
          project_id: project_id,
          emp_id: token.current_emp_id,
          stage_id: project.current_stage_id,
        });
        if (checkQeueVal) {
          customError(projectMessageErr.MessQueue);
        }
        const checkParentExec = await this.projectsUtils.checkUpdateExec(executor_id, token);
        if (!checkParentExec) {
          customError(projectMessageErr.MessCheckParentExec);
        }
      }

      await this.ExecInprojectRouteEntity.delete({
        project_id: project_id,
        id: executor_id,
      });
      return true;
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }
  async getExecInStageProjectByID(id): Promise<ExecInprojectRouteEntity | HttpException> {
    try {
      return await this.ExecInprojectRouteEntity.findOne({
        where: {
          id: id,
        },
      });
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }
  async updateExecInStageProject(
    updateExectDto: UpdateExecProjectDto,
    token: IToken,
  ): Promise<ExecInprojectRouteEntity> {
    try {
      const project = await this.projectsRepository.findOne({
        where: {
          id: updateExectDto.project_id,
        },
      });
      const execIncurrentStage = await this.ExecInprojectRouteEntity.findOne({
        where: {
          project_id: updateExectDto.project_id,
          stage_id: updateExectDto.stage_id,
          executor_id: token.current_emp_id,
        },
      });
      if (project.status_id === ProjectStatus.INWORK) {
        const checkQeueVal = await checkQueue({
          manager: this.dataSource.manager,
          project_id: project.id,
          emp_id: token.current_emp_id,
          stage_id: project.current_stage_id,
        });
        if (checkQeueVal) {
          customError(projectMessageErr.MessQueue);
        }
        const checkParentExec = await this.projectsUtils.checkUpdateExec(updateExectDto.id, token);
        if (!checkParentExec) {
          customError(projectMessageErr.MessCheckParentExec);
        }
        if (execIncurrentStage.queue > updateExectDto.queue) {
          customError(
            projectMessageErr.ErrorQueue.replace("NUMBER_VALUE", String(execIncurrentStage.queue)),
          );
        }
      }

      await this.ExecInprojectRouteEntity.update({ id: updateExectDto.id }, updateExectDto);
      return await this.ExecInprojectRouteEntity.findOne({
        where: {
          id: updateExectDto.id,
        },
      });
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }
}
