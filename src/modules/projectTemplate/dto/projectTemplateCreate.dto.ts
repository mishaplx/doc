import { ArgsType, Field } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { valid_bool, valid_int } from "../../../common/utils/utils.dto";

@ArgsType()
export class projectTemplateCreateDto {
  @Field(() => Number, {
    nullable: true,
    description: "Вид документа",
  })
  @Transform(valid_int)
  tdoc?: number;

  @Field(() => Boolean, {
    nullable: true,
    description: "Признак шаблона",
  })
  @Transform(valid_bool)
  isTemplate?: boolean;

  @Field(() => String, {
    nullable: true,
    description: "Наименование шаблона",
  })
  nm?: string;
}
