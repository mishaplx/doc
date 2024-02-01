import { Inject, Injectable, Scope } from "@nestjs/common";
import { Args, Resolver, Subscription } from "@nestjs/graphql";
import { PubSubEngine } from "graphql-subscriptions";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { PsEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { indifferentActivity } from "src/auth/decorator/indifferentActivity.decorator";
import { isPublic } from "src/auth/decorator/public.decorator";
import { PUB_SUB } from "src/pubsub/pubsub.symbols";
import { PubSubBaseDto } from "./pubsub.dto";

/********************************************
 * RESOLVER-SINGLETON ДЛЯ ПОДПИСОК
 * !!! НЕ СВЯЗАН С SERVICE !!!
 ********************************************/
@Injectable({ scope: Scope.DEFAULT })
@Resolver()
export class ResolverPubSub {
  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSubEngine) {}

  /**
   * ОПОВЕЩЕНИЕ: БАЗОВОЕ
   */
  @Subscription(() => PubSubBaseDto, {
    name: PsEnum.base,
    description: "Подписка на базовое оповещение",
    filter: async (payload: any, variables: any, context: any) => {
      // console.log('--- filter ---\n', payload, args, context);
      const tokenSub: IToken = context.jwtPayload; // токен подписчика

      // отправлять сообщения только адресату
      const ret =
        payload.org &&
        payload.org === tokenSub?.url &&
        ((payload.emp_id && payload.emp_id === tokenSub?.current_emp_id) ||
          (payload.session_id && payload.session_id === tokenSub?.session_id));

      // проверить актуальность токена перед отправкой без обновления времени последней актовности
      if (ret) {
        //  verifyTokenAccess
        //   const parsedToken = await getTokenFromHeader(context.connectionParams);
        //   const dataSource = await getDataSourceAdmin(payload.url);
        //   validAuthSession({
        //     managerLocal: dataSource.manager,
        //     access_token: tokenSub,
        //     refresh_date_activity: false,
        //   });
      }

      return ret;
    },
    // resolve: (payload: any, args: any, context: any, info: any) => {
    //   console.log(payload, args, context, info);
    // }
  })
  @isPublic() // отключить общий механизм аутентификации, используется аутентификация в graphql.module.ts
  @indifferentActivity()
  subscriptionBase(
    @Args("args", {
      nullable: true,
      defaultValue: "",
      description: "Аргументы (не задействовано)",
    })
    args?: string,
  ): AsyncIterator<PubSubBaseDto> {
    return this.pubSub.asyncIterator(PsEnum.base);
  }

  @isPublic() // отключить общий механизм аутентификации, используется аутентификация в graphql.module.ts
  @Subscription(() => PubSubBaseDto, {
    name: PsEnum.admin,
    description: "Подписка на логи сервера по процессу создания базы",
  })
  // @indifferentActivity()
  subscriptionAdmin(): AsyncIterator<PubSubBaseDto> {
    return this.pubSub.asyncIterator(PsEnum.admin);
  }
}
