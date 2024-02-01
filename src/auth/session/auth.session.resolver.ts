import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { Token } from "../decorator/token.decorator";
import { OrderUserSessionInput } from "./auth.session.dto";
import { PaginatedSessionResponseDto } from "../dto/paginated.dto";
import { AuthSessionService } from "./auth.session.service";
import { UserSessionEntity } from "src/entity/#organization/user/userSession.entity";

const DESC = "Сессии пользователя: ";

@Resolver()
export class AuthSessionResolver {
  constructor(private readonly authSessionService: AuthSessionService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedSessionResponseDto, {
    description: DESC + "получить список",
  })
  async listAuthSession(
    @Token() token: IToken,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка (отключено)",
    })
    order?: OrderUserSessionInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду (отключено)",
    })
    searchField?: string,
  ): Promise<PaginatedSessionResponseDto> {
    return await this.authSessionService.listAuthSession(token, pagination, order, searchField);
  }

  /**
   * CREATE API SESSION
   */
  @Mutation(() => UserSessionEntity, {
    description: DESC + "создать запись для общего api-доступа",
  })
  async createAuthApiSession(
    @Token() token: IToken,

    @Args("date_end", {
      nullable: false,
      description: "Дата завершения сессии"
    })
    date_end: Date,

    @Args("note", {
      nullable: true,
      description: "Примечание",
    })
    note?: string,
  ): Promise<UserSessionEntity> {
    return this.authSessionService.createAuthApiSession({
      token: token,
      date_end: date_end,
      note: note,
    });
  }


  /**
   * UPDATE API SESSION
   */
  @Mutation(() => UserSessionEntity, {
    description: DESC + "обновить запись для общего api-доступа",
  })
  async updateAuthApiSession(
    @Token() token: IToken,
    @Args("session_id", {
      nullable: false,
      description: "id сессии",
    })
    session_id: number,
    @Args("note", {
      nullable: false,
      description: "Примечание",
    })
    note: string,
  ): Promise<UserSessionEntity> {
    return this.authSessionService.updateAuthApiSession({
      token: token,
      session_id: session_id,
      note: note,
    });
  }


  /**
   * DELETE API SESSION
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить запись для общего api-доступа",
  })
  async deleteAuthApiSession(
    @Token() token: IToken,
    @Args("session_id", {
      nullable: false,
      description: "id сессии",
    })
    session_id: number,
  ): Promise<boolean> {
    return this.authSessionService.deleteAuthApiSession({
      token: token,
      session_id: session_id,
    });
  }

}
