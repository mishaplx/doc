import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

import { join } from "path";
import process from "process";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NotifyModule } from "src/modules/notify/notify.module";
import { NumModule } from "src/modules/num/num.module";
import { RelModule } from "src/modules/rel/rel.module";
import { RelTypesModule } from "src/modules/rel/relTypes/relTypes.module";
import { ReportModule } from "src/modules/report/report.module";
import { RlsModule } from "src/modules/rls/rls.module";
import { SignModule } from "src/modules/sign/sign.module";
import { AuthModule } from "../auth/auth.module";
import {
  cutTokenAccessHeader,
  parseTokenAccess,
  verifyTokenAccess,
} from "../auth/token/auth.token.utils";
import { AuthUserService } from "../auth/user/auth.user.service";
import { DocModule } from "../modules/doc/doc.module";
import { EmpModule } from "../modules/emp/emp.module";
import { FileModule } from "../modules/file/file.module";
import { GroupModule } from "../modules/group/group.module";
import { JobsModule } from "../modules/job/job.module";
import { PostModule } from "../modules/post/post.module";
import { SubdivisionModule } from "../modules/subdivision/subdivision.module";
import { TemplateContentModule } from "../modules/templateContent/templateContent.module";
import { TypeSendModule } from "../modules/typeSend/typeSend.module";
import { UserModel } from "../modules/user/users.module";
import { WorkerModule } from "../modules/worker/worker.module";
import { SearchModule } from "../search/search.module";

export interface GqlContext {
  req: Request;
  res: Response;
  payload?: IToken;
  connection: any; // required for subscription
}

const REQUEST_TIMEOUT = 30000;

/**
 * @link https://bleepcoder.com/docs-nestjs-com/438763030/document-how-authentication-guards-for-graphql-subscriptions
 */
@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync({
      imports: [AuthModule],
      driver: ApolloDriver,
      useFactory: async () =>
        // authService: AuthService - пока не нужно
        {
          /**
           *  распарсить и проверить token_access
           */
          const getTokenFromHeader = async (header: any): Promise<IToken> => {
            const strToken = cutTokenAccessHeader(header);
            if (!strToken) return;
            return await verifyTokenAccess(strToken);
          };

          return {
            debug: true,
            playground: process.env.PLAYGROUND === "true",
            introspection: true,
            installSubscriptionHandlers: true,
            autoSchemaFile: join(process.cwd(), "src/shema.gql"),
            resolvers: { JSON: GraphQLJSON },
            context: async (context) => {
              if (context?.connectionParams) {
                // для graphql-ws контекст определяем здесь
                const parsedToken = await getTokenFromHeader(context.connectionParams);
                return {
                  jwtPayload: parsedToken,
                  headers: context.connectionParams,
                  requestTimeout: REQUEST_TIMEOUT,
                };
              } else {
                // запросы с site web
                // запросы с graphql web, в т.ч. introspection
                // const parsedToken = await getTokenFromHeader(context?.req?.headers);
                return {
                  ...context,
                  // jwtPayload: parsedToken,
                  requestTimeout: REQUEST_TIMEOUT,
                };
              }
            },
            cors: {
              origin: "*",
              credentials: true,
            },
            sortSchema: true,
            subscriptions: {
              // сформировать псевдоконтекст, который будет передаваться как context @link https://husl.ru/questions/1409020
              "graphql-ws": {
                onConnect: async (params) => {
                  await getTokenFromHeader(params.connectionParams);
                  // результат здесь не имеет значения (смотри context)
                  // return { jwtPayload: parsedToken, headers: params.connectionParams }
                },
              },

              // ТОЛЬКО для graphql web subscription - ! применяется устаревший стандарт !
              "subscriptions-transport-ws": {
                onConnect: async (params) => {
                  const parsedToken = await getTokenFromHeader(params);
                  return {
                    jwtPayload: parsedToken,
                    headers: params,
                  };
                },
              },
            },
          };
        },
      inject: [AuthUserService],
    }),

    UserModel,
    RelModule,
    RelTypesModule,
    RlsModule,
    NumModule,
    NotifyModule,
    // InitModule,
    SearchModule,
    EmpModule,
    WorkerModule,
    PostModule,
    SubdivisionModule,
    TypeSendModule,
    AuthModule,
    ReportModule,
    FileModule,
    DocModule,
    TemplateContentModule,
    JobsModule,
    GroupModule,
    SignModule,
  ],
  controllers: [],
  providers: [],
})
export class graphqlModule {}
