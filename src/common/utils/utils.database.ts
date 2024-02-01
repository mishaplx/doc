import { DataSource, EntityManager } from "typeorm";

/**
 * ВЫЗОВ ФУНКЦИИ FUN С ПЕРЕДАННЫМ MANAGER ИЛИ ПОЛУЧЕННЫМ ИЗ DATASOURCE
 * TODO: ПОТОМ ДОДЕЛАТЬ
 */
export const runnerManager = async <TypeArgFun, TypeRetFun>(args: {
  manager?: EntityManager;
  dataSource: DataSource;
  fun: (args: TypeArgFun & { manager: EntityManager }) => TypeRetFun;
  argsFun: TypeArgFun;
}): Promise<TypeRetFun> => {
  //const { manager, dataSource, fun, ...argOther } = args;
  return args.manager
    ? await args.fun({ ...args.argsFun, ...{ manager: args.manager } })
    : await args.dataSource.transaction(
        async (manager) => await args.fun({ ...args.argsFun, ...{ manager: manager } }),
      );
};
