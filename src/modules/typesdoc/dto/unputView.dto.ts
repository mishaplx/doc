import { Field, InputType } from "@nestjs/graphql";
import { Length, ValidateIf } from "class-validator";
@InputType()
export class UnputViewDto {
  @Field({ nullable: true, description: "Наименование вида документа" })
  nm?: string;

  @Field({ nullable: true, description: "Код вида документа" })
  @ValidateIf((obj) => obj.code)
  @Length(3)
  code?: string;

  @Field({ nullable: true, description: "Типы документов в СМДО: наименование" })
  smdoDocTypes?: string;

  dtc: Date;

  temp: boolean;
}
