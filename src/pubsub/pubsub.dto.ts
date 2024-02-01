import { Field, ObjectType } from "@nestjs/graphql";
import { PsBaseCodeEnum, PsBaseEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";
import { BaseEntity } from "typeorm";

@ObjectType({ description: "Базовое оповещение с сервера" })
export class PubSubBaseDto extends BaseEntity {
  @Field(() => PsBaseEnum, { description: "Тип оповещения" })
  type: PsBaseEnum;

  @Field({ nullable: true, description: "Сообщение" })
  message?: string;

  @Field(() => [PsBaseCodeEnum], { nullable: true, description: "Коды событий" })
  code?: PsBaseCodeEnum[];
}
