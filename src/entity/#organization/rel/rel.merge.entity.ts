import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { DocEntity } from "../doc/doc.entity";

@ObjectType({ description: "Все связки документа" })
export class RelMergeEntity {
  @Field(() => Int, {
    nullable: false,
    description: "ID связки",
  })
  id: number;

  /********************************************/
  @Field(() => String, {
    nullable: false,
    description: "Наименование связки",
  })
  name: string;

  /********************************************/
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания связки",
  })
  date_create: Date;

  /********************************************/
  @Field({
    nullable: false,
    description: "Признак прямой связки",
  })
  direct: boolean;

  /********************************************/
  @Field(() => DocEntity, {
    nullable: false,
    description: "Связанный документ",
  })
  Doc: DocEntity;
}
