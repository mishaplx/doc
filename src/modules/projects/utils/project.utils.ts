import { EntityManager } from "typeorm";

import { ExecInprojectRouteEntity } from "src/entity/#organization/project/execInprojectRoute.entity";
import { ProjectEntity } from "src/entity/#organization/project/project.entity";
import { ProjectStatus } from "../projects.const";

/**
 * проверка очереди пользователей на определённом этапе проекта
 * при возврате функции true - ошибка очереди
 * при возврате функции false - сейчас ваша очередь
 */
export const checkQueue = async (args: {
  manager: EntityManager;
  project_id: number;
  emp_id: number;
  stage_id: number;
}): Promise<boolean> => {
  const { manager, project_id, emp_id, stage_id } = args;
  const currentProject = await manager.findOne(ProjectEntity, {
    where: {
      id: project_id,
    },
  });
  if (
    currentProject.status_id === ProjectStatus.FIX &&
    (emp_id === currentProject.user_created_id || emp_id === currentProject.executor_id)
  ) {
    return false;
  }
  const arrExecutorInProject: ExecInprojectRouteEntity[] =
    await manager.find(ExecInprojectRouteEntity, {
      where: {
        project_id: project_id,
        stage_id: stage_id,
      },
      order: { queue: "ASC" },
    });
  // проверка на одно исполнителя на этапе
  if (arrExecutorInProject.length === 1 && arrExecutorInProject[0].executor_id === emp_id) {
    return false;
  }

  // Проверка на существование пользователя на этапе
  const checkExistExecutor = arrExecutorInProject.map((e) => e.executor_id).includes(emp_id);
  const indexCurrentExecutor = arrExecutorInProject
    .map((e) => e.executor_id)
    .findIndex((executor) => executor === emp_id);
  if (indexCurrentExecutor == -1) return true;
  // Проверка что перед пользователем нет очереди
  if (indexCurrentExecutor === 0 && checkExistExecutor) {
    return false;
  }

  const targetExecutor = arrExecutorInProject[indexCurrentExecutor];
  return isNextObjectFillable(arrExecutorInProject, targetExecutor);
};


/**
 *
 */
export const isNextObjectFillable = (arrayExecutorInStage, targetExecutor): boolean => {
  // Находим индекс текущего объекта
  const firstMatchingIndex = arrayExecutorInStage.findIndex(
    (obj) => obj.executor_id === targetExecutor.executor_id,
  );
  if (firstMatchingIndex === -1) {
    return true;
  }

  // Находим индекс предыдущего объекта
  const previosExecutorIndex = arrayExecutorInStage.findIndex(
    (obj, index) => index === firstMatchingIndex - 1,
  );
  if (previosExecutorIndex === -1) {
    return false;
  }
  if (
    arrayExecutorInStage[previosExecutorIndex].queue ===
      arrayExecutorInStage[firstMatchingIndex].queue &&
    !arrayExecutorInStage.slice(0, previosExecutorIndex + 1).every((exec) => exec.result !== null)
  ) {
    return !arrayExecutorInStage
      .slice(0, previosExecutorIndex + 1)
      .filter((exec) => exec.queue !== targetExecutor.queue)
      .every((exec) => exec.result !== null);
  }

  return !arrayExecutorInStage
    .slice(0, previosExecutorIndex + 1)
    .every((exec) => exec.result !== null);
};
