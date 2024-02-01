import { ExecutionContext, HttpException } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserType } from "./dto/user.type";
import { AllUserForEmp, AllUserForEmpClass, UserService } from "./user.service";

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation(() => UserEntity)
  async deactivatedUser(
    @Args("id") id: number,
    @Args("flag", {
      nullable: false,
      defaultValue: false,
      description:
        "При отправке flag==true, пользователь деактивируется," +
        "При отправке flag==false, пользователь активируется,",
    })
    flag: boolean,
    @Token() token: IToken,
  ): Promise<UserEntity> {
    return await this.usersService.deactivatedUser(id, flag, token);
  }

  @Mutation(() => UserType)
  async updateUser(
    @Args("update") update: UpdateUserDto,
    @Token() token: IToken,
  ): Promise<UserType | HttpException> {
    return await this.usersService.updateUser(update, token);
  }

  @Mutation(() => Boolean)
  async changePassword(
    @Args("id") id: number,
    @Args("newPassword") newPassword: string,
    @Token() token: IToken,
  ): Promise<boolean> {
    return await this.usersService.changePassword(id, newPassword, token);
  }

  @Mutation(() => Boolean)
  async changePasswordFromOld(
    @Args("id") id: number,
    @Args("oldPassword") oldPassword: string,
    @Args("newPassword") newPassword: string,
    @Token() token: IToken,
  ): Promise<boolean | HttpException> {
    return await this.usersService.changePasswordFromOld(id, oldPassword, newPassword, token);
  }

  @Query(() => UserType, {
    nullable: true,
    description: "получение пользователя по id",
  })
  getUserById(
    @Args("id", {
      type: () => Int,
    })
    id: number,
    @Token() token: IToken,
  ): Promise<UserType> {
    return this.usersService.getUserById(id, token);
  }

  @Query(() => [AllUserForEmpClass], {
    nullable: true,
    description: "получение пользователя по id",
  })
  getAllUserForEmp(@Context() context: ExecutionContext): Promise<AllUserForEmp[] | HttpException> {
    return this.usersService.getAllUserForEmp(context);
  }
}
