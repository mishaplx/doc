import { DataSource } from "typeorm";
import { OperationNeighborList, arrGeneralOperation } from "./role.enum";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";

interface IresultOperation {
  admin: boolean;
  accessOperation: string[];
}

/**
 *  Получить список доступных операций
 */
export const getAccessOperation = async (args: {
  dataSource: DataSource;
  emp_id: number;
}): Promise<IresultOperation> => {
  const { dataSource, emp_id } = args;
  let resultObj: IresultOperation = {
    admin: false,
    accessOperation: [],
  };
  const { roles, is_admin } = await dataSource.getRepository(EmpEntity).findOne({
    select: {
      id: true,
      roles: true,
      is_admin: true,
    },
    where: { id: emp_id },
    relations: {
      roles: {
        RoleOperations: {
          Operation: true,
        },
      },
    },
  });
  if (is_admin) {
    const allOperation = await dataSource
      .getRepository(OperationEntity)
      .find({ select: { function_name: true } });
    const allOperationRes = allOperation.map((el) => el.function_name);
    resultObj = {
      admin: is_admin,
      accessOperation: allOperationRes.concat(arrGeneralOperation),
    };
    return resultObj;
  }

  const function_name: string[] = [];
  for (const role of roles) {
    for (const roleElement of role.RoleOperations) {
      const operation = await roleElement.Operation;
      function_name.push(operation.function_name);
      // добавить смежные разрешенные операции
      const operationNeighborList = OperationNeighborList[operation.function_name];
      if (operationNeighborList) function_name.push(...operationNeighborList);
    }
  }

  resultObj.admin = false;
  resultObj.accessOperation = function_name.flat().concat(arrGeneralOperation);
  return resultObj;
};
