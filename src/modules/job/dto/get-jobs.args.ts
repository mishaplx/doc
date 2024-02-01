import { ArgsType, Field, Int } from "@nestjs/graphql";
import { PartiesJobs, TabsJobs } from "../job.const";

@ArgsType()
export class GetJobsArgs {
  @Field(() => [Int], {
    nullable: true,
    description: "Идентификационные номера поручений.",
  })
  ids?: number[];

  @Field(() => Int, { nullable: true, description: "Id документа." })
  docId?: number;

  @Field(() => TabsJobs, {
    nullable: true,
    description: "Вкладка поручения.",
    defaultValue: TabsJobs.ALL,
  })
  flagStatus?: TabsJobs;

  @Field(() => [PartiesJobs], {
    nullable: true,
    description: "Кем является пользователь в поручении.",
  })
  user?: PartiesJobs[];

  @Field(() => Boolean, {
    nullable: true,
    description: "Просроченные поручения.",
  })
  overdue?: boolean;

  @Field(() => Boolean, { nullable: true, description: "Срок истекает." })
  termExpires?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Ожидание результатов контроля.",
  })
  waitingControl?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Ожидающие результатов предконтроля.",
  })
  waitingPreControl?: boolean;

  @Field({ nullable: true, description: "Дата создания." })
  dtc?: Date;

  @Field(() => String, { nullable: true, description: "Содержание." })
  body?: string;

  @Field(() => String, { nullable: true, description: "Исполнитель." })
  executor?: string;

  @Field({ nullable: true, description: "Исполнить до." })
  executionDate?: Date;

  @Field(() => String, { nullable: true, description: "Автор." })
  author?: string;

  @Field(() => Int, { nullable: true, description: "Статус." })
  status?: number;

  @Field({ nullable: true, description: "Фактическое исполнение." })
  factDate?: Date;

  @Field(() => Int, { nullable: true, description: "Контроль." })
  jobControl?: number;

  @Field(() => String, { nullable: true, description: "Документ." })
  nameDocInJob?: string;

  @Field(() => String, { nullable: true, description: "Номер поручения." })
  num?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: "Поручения первого уровня, у которых нет вышестоящих поручений.",
  })
  mainJob?: boolean;

  @Field(() => Int, {
    nullable: true,
    description: "Тип поручения",
  })
  typeJob?: number;
}
