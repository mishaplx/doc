import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";

import "dotenv/config";

import { DataSource, Repository } from "typeorm";
import { APIErrorCodeEnum } from "../../BACK_SYNC_FRONT/enum/enum.api";
import { PREF_ERR } from "../../common/enum/enum";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { AUTH } from "../auth.const";
@Injectable()
export class DeactivateGuard implements CanActivate {
  private readonly userRepository: Repository<UserEntity>;
  private readonly OperationRepository: Repository<OperationEntity>;
  private readonly EmpRepository: Repository<EmpEntity>;
  private readonly RoleRepository: Repository<RolesEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(UserEntity);
    this.OperationRepository = dataSource.getRepository(OperationEntity);
    this.EmpRepository = dataSource.getRepository(EmpEntity);
    this.RoleRepository = dataSource.getRepository(RolesEntity);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("DeactivateGuard");
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    ctx.getHandler().name;
    // UserListTypelog(ctx.getHandler().name, 'name');

    const token = req?.get("Authorization")?.replace("Bearer", "").trim();
    const payload: IToken = new JwtService().decode(token)["payload"];
    if (payload.current_emp_id == null) {
      throw new HttpException(`${PREF_ERR}У вас нет назначения`, HttpStatus.BAD_REQUEST);
    }
    const user = await this.userRepository.findOne({
      select: { isblocked: true },
      where: {
        current_emp_id: payload.current_emp_id,
      },
      cache: Number(process.env.GUARD_CACHE_TIME_30C),
    });
    if (user == undefined) {
      console.log("user == undefined");
      throw new HttpException(`${PREF_ERR}У вас нет назначения`, HttpStatus.BAD_REQUEST);
    }
    if (user.isblocked) {
      throw new HttpException(AUTH.ERR.USER.BLOCK, APIErrorCodeEnum.auth_block);
    }

    return !user.isblocked;
  }
}
