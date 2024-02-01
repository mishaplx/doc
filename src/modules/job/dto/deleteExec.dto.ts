import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
@ArgsType()
@InputType()
export class DeleteExecDto {
  /** id записи в ExecJob */
  @Field({ description: "id записи в ExecJob" })
  id: number;
}
