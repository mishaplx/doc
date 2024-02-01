import { Field, InputType, Int } from "@nestjs/graphql";
import { IsDate, IsPositive } from "class-validator";

@InputType()
export class CreateJobControlInput {
  @Field(() => Int, { description: "Поручение" })
  @IsPositive()
  job_id: number;

  @Field(() => Int, { description: "Тип контроля" })
  @IsPositive()
  job_control_type_id: number;

  @Field(() => Int, { description: "Контролер" })
  @IsPositive()
  controller_id: number;

  @Field({ description: "Плановая дата" })
  @IsDate()
  date_plan: Date;

  @Field(() => Int, { nullable: true, description: "Предконтролер" })
  prev_controller_id: number;
}
