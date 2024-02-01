import { Field, InputType } from "@nestjs/graphql";
import { Length } from "class-validator";

@InputType()
export class jobReportInput {
  @Field({ description: "Флаг итогового отчёта" })
  finalReport: boolean;

  @Field({ description: "Текст отчёта" })
  @Length(1, 300)
  reportText: string;
}
