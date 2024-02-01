import {
  CanActivate,
  CustomDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { customError } from "../../../common/type/errorHelper.type";
import { getDataSourceAdmin } from "../../../database/datasource/tenancy/tenancy.utils";
import { ACCESS_MSG } from "../const/access.const";
import { ACTION_OBJECTS } from "../const/actions";
import { getActionObjectsInd } from "../utils/utils";
import { accessGuardParserArgs } from "./access.guard.parserArg";

const KEY_ACTION = "guard_action";

/**
 * ДЕКОРАТОР: СПИСОК ВЫПОЛНЯЕМЫХ ОПЕРАЦИЙ
 * @example `@Access(ActionsJob.JOB_CONTROL_CANCEL, ActionsJob.JOB_CONTROL_ADD)`
 */
export const Access = (...action: string[]): CustomDecorator => SetMetadata(KEY_ACTION, action);

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    // @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // список предполагаемых операций
    const actions = this.reflector.get<string[]>(KEY_ACTION, context.getHandler());
    if (!actions) {
      return true;
    }

    const action_objects_ind = getActionObjectsInd(actions);
    if (action_objects_ind < 0) customError(ACCESS_MSG.CATEGORY_UNKNOWN);

    // прочитать токен -> emp_id
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const token = req?.get("Authorization")?.replace("Bearer", "").trim();
    const payload: IToken = new JwtService().decode(token)["payload"];
    const emp_id = payload.current_emp_id;

    // аргументы вызываемого метода
    const args = ctx.getArgs();

    // получить идентификаторы объектов (объекта) из входящих аргументов (args_in)
    const object_ids = accessGuardParserArgs(action_objects_ind, args);

    // подключиться к БД как админ
    const dataSource = await getDataSourceAdmin(payload.url);

    // TODO: проверка роли

    // проверить доступ для каждого главного объекта, для каждой операции
    const access = new ACTION_OBJECTS[action_objects_ind].validator(dataSource);
    await access.valid({
      actions: actions,
      emp_id: emp_id,
      ["args_parsed"]: object_ids,
      ["args_origin"]: args,
    });

    return true;
  }
}
