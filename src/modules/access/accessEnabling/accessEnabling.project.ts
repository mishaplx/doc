import { ActionsProject } from "src/BACK_SYNC_FRONT/actions/actions.project";
import { DocProject } from "src/common/enum/enum";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { ExecInprojectRouteEntity } from "src/entity/#organization/project/execInprojectRoute.entity";
import { ProjectCurrentRouteEntity } from "src/entity/#organization/project/ProjectcurrentRoute.entity";
import { checkQueue } from "src/modules/projects/utils/project.utils";
import { EntityManager } from "typeorm";

import { ProjectEntity } from "../../../entity/#organization/project/project.entity";
import { ACCESS_STATUS_PROJECT } from "../const/status/status.project";
import { delActions } from "../utils/utils";

/**
 * ПРОЕКТЫ: ДОПУСТИМЫЕ ОПЕРАЦИИ
 */
export const getAccessEnablingProject = async (args: {
  emp_id: number;
  manager: EntityManager;
  projectEntity: ProjectEntity;
}): Promise<string[]> => {
  const { emp_id, manager, projectEntity } = args;
  const empEntity = await manager.findOneBy(EmpEntity, { id: emp_id, del: false });

  // при отсутствии назначения все запрещено
  if (!empEntity) return [];

  // является ли emp админом, контролером, предконтролером, пришла ли очередь
  const status = {
    admin: empEntity.is_admin,
    creator: projectEntity.user_created_id == emp_id,
    executor: projectEntity.executor_id == emp_id,
    queue: !(await checkQueue({
      manager: manager,
      project_id: projectEntity.id,
      emp_id: emp_id,
      stage_id: projectEntity.current_stage_id,
    })),
  };
  // скорректировать наступление с учетом возможного решения исполнителя при параллельном рассмотрении
  if (status.queue) {
    // текущая стадия в текущем этапе
    const t2 = manager
      .createQueryBuilder(ExecInprojectRouteEntity, "t2")
      .select("MIN(t2.queue) as queue")
      .where(`t2.project_id = ${projectEntity.id}`)
      .andWhere(`t2.stage_id = ${projectEntity.current_stage_id}`)
      .andWhere(`t2.del = false`)
      .andWhere(`t2.temp = false`)
      .andWhere(`t2.result IS NULL`)
      .getQuery();
    // наличие исполнителя emp_id в текущей стадии текущего этапа
    const t1 = await manager
      .createQueryBuilder(ExecInprojectRouteEntity, "t1")
      .select("1")
      .innerJoin("(" + t2 + ")", "t2", "t1.queue = t2.queue")
      .where(`t1.executor_id = ${emp_id}`)
      .andWhere(`t1.project_id = ${projectEntity.id}`)
      .andWhere(`t1.stage_id = ${projectEntity.current_stage_id}`)
      .andWhere(`t1.del = false`)
      .andWhere(`t1.temp = false`)
      .andWhere(`t1.result IS NULL`)
      .getRawMany();
    status.queue = t1?.length == 1;
  }

  // разрешенные операции для статуса
  let ret = Object.keys(ACCESS_STATUS_PROJECT).filter((item) =>
    ACCESS_STATUS_PROJECT[item].includes(projectEntity.status_id),
  );

  // доступные операции на этапе проекта
  const projectCurrent = await manager.findOneBy(ProjectCurrentRouteEntity, {
    project_id: projectEntity.id,
    stage_id: projectEntity.current_stage_id,
  });

  // закрытие проекта
  // админ, создатель и исполнитель - на любой стадии
  // иные - наступила очередь и флаг доступной операции
  if (
    !(
      status.admin ||
      status.creator ||
      status.executor ||
      (status.queue && (projectCurrent?.flag_close ?? false))
    )
  )
    ret = delActions(ret, [ActionsProject.PROJECT_CLOSE]);

  // добавление/удаление исполнителей
  // админ, создатель и исполнитель - на любой стадии
  // иные:
  //   статус проекта "Новый"
  //   наступила очередь и
  //   флаг доступной операции и
  //   ?
  if (
    !(
      status.admin ||
      status.creator ||
      status.executor ||
      projectEntity.status_id == DocProject.NEW ||
      (status.queue && (projectCurrent?.flag_for_do ?? false))
    )
  )
    ret = delActions(ret, [ActionsProject.PROJECT_EXEC_ADD, ActionsProject.PROJECT_EXEC_DEL]);

  // очередь НАСТУПИЛА
  if (status.queue) {
    if (!(projectCurrent?.flag_with_remarks ?? false))
      ret = delActions(ret, [ActionsProject.PROJECT_DONE_REMARK]);
    if (!(projectCurrent?.flag_for_revision ?? false))
      ret = delActions(ret, [ActionsProject.PROJECT_REWORK]);

    // очередь НЕ НАСТУПИЛА
  } else {
    ret = delActions(ret, [
      ActionsProject.PROJECT_DONE_OK,
      ActionsProject.PROJECT_DONE_REMARK,
      ActionsProject.PROJECT_REWORK,
    ]);
  }

  return ret;
};
