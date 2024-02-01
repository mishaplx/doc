import { ExecutionContext, HttpException } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Token } from "src/auth/decorator/token.decorator";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { UserIp } from "../common/utils/utils.decorator";
import { defaultPaginationValues, PaginationInput } from "../pagination/paginationDTO";
import { CheckUserDecorator } from "./decorator/checkUser.decorator";
import { indifferentActivity } from "./decorator/indifferentActivity.decorator";
import { isPublic } from "./decorator/public.decorator";
import { CheckToken } from "./dto/checkToken";
import { GetAuthArgs } from "./dto/get-auth.args";
import { LoginResponse } from "./dto/login-response";
import { LoginUserInputUp } from "./dto/login-user-Up.input";
import { loginUserInputIn } from "./dto/login-userIn.input";
import { OrderAuthInput } from "./dto/order-auth-request.dto";
import { PaginatedUserForDbResponseDto } from "./dto/paginated.dto";
import { AuthUserService } from "./user/auth.user.service";

@Resolver()
export class AuthResolver {
  constructor(private readonly authUserService: AuthUserService) {}

  @Mutation(() => String, { description: "Регистрация пользователя" })
  @isPublic()
  async SingUp(
    @Args("LoginUserInputUp", {
      description: "данные пользователя для регистрации",
    })
    loginUserInputUp: LoginUserInputUp,

    @Context() context: ExecutionContext,
    @Token() token: IToken,
  ): Promise<HttpException | string> {
    return await this.authUserService.userSignUp({
      loginUserInputUp: loginUserInputUp,
      context: context,
      access_token: token,
    });
  }

  @Mutation(() => LoginResponse, { description: "Авторизация пользователя" })
  @isPublic()
  async SignIn(
    @Args("loginUserInputIn", {
      description: "логин и пароль",
    })
    loginUserInputIn: loginUserInputIn,

    @UserIp() ip: string,
  ): Promise<LoginResponse> {
    return await this.authUserService.userSignIn(loginUserInputIn, ip);
  }

  @Query(() => PaginatedUserForDbResponseDto, { description: "Список пользователей" })
  async SignList(
    @Args() args: GetAuthArgs,
    @Token() token: IToken,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderAuthInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedUserForDbResponseDto> {
    return await this.authUserService.userList(token, args, pagination, order, searchField);
  }

  @Mutation(() => Boolean, { description: "Удаление пользователей" })
  async deleteUser(
    @Context() context,
    @Args("id", {
      description: "id пользователя",
    })
    id: number,
  ): Promise<boolean | HttpException> {
    return await this.authUserService.userDelete(id, context);
  }

  @isPublic()
  @indifferentActivity()
  @Mutation(() => LoginResponse, {
    description: "Обновить регистрацию",
  })
  async getNewToken(
    @Context() context,
    @Args("refresh", { description: "refresh token" }) refresh: string,
  ): Promise<LoginResponse> {
    return await this.authUserService.userSignRefresh({
      refresh_token: refresh,
      context: context,
    });
  }

  @Mutation(() => Boolean)
  async logOut(@Token() token: IToken): Promise<boolean> {
    return await this.authUserService.userSignOut(token);
  }

  @isPublic()
  @Query(() => CheckToken)
  async checkToken(@CheckUserDecorator() obj: CheckToken): Promise<number | CheckToken> {
    if (obj == undefined) {
      return 1;
    }
    return obj;
  }
}
