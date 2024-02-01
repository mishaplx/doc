import { Field, InputType, Int } from "@nestjs/graphql";
import { IsPositive } from "class-validator";

@InputType()
export class UpdateSystemSettingsInput {
  @Field(() => Int)
  @IsPositive()
  id!: number;

  @Field({ nullable: true, description: "Значение" })
  value: string;
}
