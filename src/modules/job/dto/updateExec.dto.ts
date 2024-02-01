import { ArgsType, Field, GraphQLISODateTime, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
@ArgsType()
@InputType()
export class UpdateExecDto {
  /** id записи в ExecJob */
  @Field({ nullable: false, description: "id записи в ExecJob" })
  id: number;

  /** флаг: ответственный исполнитель */
  @Field({ nullable: true, description: "флаг: ответственный исполнитель" })
  is_responsible?: boolean;

  /** дата направления */
  @Field(() => GraphQLISODateTime, { nullable: true, description: "дата направления" })
  date_assign?: Date;

  /** примечание */
  @Field({ nullable: true, description: "примечание" })
  note?: string;
}
