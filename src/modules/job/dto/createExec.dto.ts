import { ArgsType, Field, GraphQLISODateTime, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
@ArgsType()
@InputType()
export class CreateExecDto {
  /** id поручения */
  @Field({ nullable: false, description: "id поручения" })
  job_id: number;

  /** id исполнителя */
  @Field({ description: "id исполнителя" })
  emp_id: number;

  /** дата направления */
  @Field(() => GraphQLISODateTime, { nullable: true, description: "дата направления" })
  date_assign: Date;

  /** примечание */
  @Field({ nullable: true, description: "примечание" })
  note?: string;
}
