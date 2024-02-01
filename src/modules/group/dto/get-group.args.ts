import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetGroupArgs {
  @Field({ nullable: true, description: "Идентификатор" })
  id?: number;

  @Field(() => [Int], { nullable: true, description: "Идентификатор(массив)" })
  ids?: number[];

  @Field({ nullable: true, description: "Дата создания" })
  dtc?: Date;

  @Field({ nullable: true, description: "Наименование" })
  nm?: string;

  @Field({ nullable: true, description: "Подразделение" })
  units?: string;

  @Field({ nullable: true, description: "searchField" })
  searchField?: string;
}
