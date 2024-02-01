import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DashboardStatisticsResponse {
  @Field(() => Int, { description: "Вход. док-ты. Новые" })
  newDocIncome: number;

  @Field(() => Int, { description: "Вход. док-ты. На регистрации" })
  inregistrateDocIncome: number;

  @Field(() => Int, { description: "Вход. док-ты. Поступившие" })
  forwardingDocIncome: number;

  @Field(() => Int, { description: "Исходящие. док-ты. Новые" })
  newDocOutcome: number;

  @Field(() => Int, { description: "Исходящие. док-ты. На регистрации" })
  inregistrateDocOutcome: number;

  @Field(() => Int, { description: "Внутренние. док-ты. Новые" })
  newDocInner: number;

  @Field(() => Int, { description: "Внутренние. док-ты. На регистрации" })
  inregistrateDocInner: number;

  @Field(() => Int, { description: "Внутренние. док-ты.Поступившие" })
  forwardingDocInner: number;

  @Field(() => Int, { description: "Поручения. Мои." })
  jobsAuthor: number;

  @Field(() => Int, { description: "Поручения. Исполнитель." })
  jobsExecutor: number;

  @Field(() => Int, { description: "Поручения. Отвественный." })
  jobsCreated: number;

  @Field(() => Int, { description: "Поручения. Контроль." })
  jobsController: number;

  @Field(() => Int, { description: "Поручения. Предконтроль." })
  jobsPrevController: number;

  @Field(() => Int, { description: "Поручения. Ожидающие результатов контроля." })
  jobsWaitingController: number;

  @Field(() => Int, { description: "Поручения. Ожидающие результатов предконтроля." })
  jobsWaitingPrevController: number;

  @Field(() => Int, { description: "Поручения. Срок истекает." })
  termExpires: number;

  @Field(() => Int, { description: "Поручения. Просрочено." })
  overdue: number;

  @Field(() => Int, { description: "Проекты. Мои." })
  projectsAuthor: number;

  @Field(() => Int, { description: "Проекты. Участники." })
  projectsMembers: number;

  @Field(() => Int, { description: "Проекты. Участники. Визировать." })
  projectsMembersVise: number;

  @Field(() => Int, { description: "Проекты. Участники. Подписать." })
  projectsMembersSign: number;

  @Field(() => Int, { description: "Проекты. Участники. Утвердить." })
  projectsMembersApprove: number;
}
