import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class JobUpdateInput {
  @Field(() => Int, { description: "id автора поручения", nullable: true })
  author_id: number;

  @Field({ description: "Содержание поручения", nullable: true })
  body: string;

  @Field(() => Int, { description: "id документа", nullable: true })
  doc_id: number;

  @Field({ description: "Срок исполнения поручения", nullable: true })
  execution_date: Date;

  @Field({
    description: "Дата фактического исполнения поручения",
    nullable: true,
  })
  fact_date: Date;

  /*
   * Номер поручения
   */
  @Field(() => String, { description: "Номер поручения", nullable: true })
  num: string;

  @Field(() => Int, {
    description: "id вышестоящего поручения",
    nullable: true,
  })
  parentJobId: number;

  @Field(() => Int, { description: "id периодичности", nullable: true })
  periodId: number;

  @Field(() => Int, { description: "id статуса поручения", nullable: true })
  statusId: number;

  @Field({ description: "Флаг временной записи", defaultValue: false })
  temp: boolean;

  @Field(() => Int, { description: "Версия поручения", nullable: true })
  version: number;

  @Field(() => Int, { description: "тип поручения", nullable: true })
  type_job: number;
}
