import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class CreateJobCtrTypeInput {
  @Field({ description: "Наименование" })
  @IsNotEmpty()
  nm!: string;

  @Field({ nullable: true, description: "ID контролера" })
  controller_id?: number;
}
