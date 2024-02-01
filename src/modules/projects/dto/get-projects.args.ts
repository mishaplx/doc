import { ArgsType, Field, GraphQLISODateTime, Int } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import { PartiesProjects } from "../../../common/enum/enum";
import { TabsProject } from "../type/project.enum";

@ArgsType()
export class GetProjectsArgs {
  @Field(() => Int, {
    nullable: true,
    description: "Идентификационный номер проекта.",
  })
  id?: number;

  @Field(() => JSON, { nullable: true, description: "Массив ID" })
  ids?: any;

  @Field(() => [PartiesProjects], {
    nullable: true,
    description: "Кем является пользователь в проекте.",
  })
  user?: PartiesProjects[];

  @Field(() => GraphQLISODateTime, { nullable: true, description: "Дата создания." })
  dtc?: Date;

  @Field(() => String, { nullable: true, description: "Наименование." })
  nm?: string;

  @Field(() => Int, { nullable: true, description: "Тип документа." })
  typeDocument?: number;

  @Field(() => Int, { nullable: true, description: "Вид документа." })
  viewDocument?: number;

  @Field(() => TabsProject, {
    nullable: true,
    description: "Вкладка проекты.",
    defaultValue: TabsProject.ALL,
  })
  flagStatus?: TabsProject;

  @Field(() => Int, { nullable: true, description: "Статус." })
  status?: number;

  @Field(() => Int, { nullable: true, description: "Этап." })
  currentStage?: number;

  @Field(() => String, { nullable: true, description: "Исполнитель." })
  executor?: string;

  @Field(() => String, { nullable: true, description: "Документ." })
  doc?: string;

  @Field(() => String, { nullable: true, description: "Заголовок" })
  short_body?: string;
}
