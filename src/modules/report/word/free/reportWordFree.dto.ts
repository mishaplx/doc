import { ArgsType, Field } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { valid_bool, valid_int } from "../../../../common/utils/utils.dto";

@ArgsType()
export class reportWordFreeDto {
  @Field(() => Number, {
    nullable: true,
    description: "id проекта",
  })
  @Transform(valid_int)
  project_id?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id документа",
  })
  @Transform(valid_int)
  doc_id?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id файла шаблона",
  })
  @Transform(valid_int)
  file_item_id?: number;

  @Field({
    nullable: true,
    description: "Параметры",
  })
  params?: string;

  @Field(() => Number, {
    nullable: true,
    description: "id поручения",
  })
  @Transform(valid_int)
  job_id?: number;

  @Field(() => Number, {
    nullable: true,
    description: "id входящей почты",
  })
  @Transform(valid_int)
  incmail_id?: number;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: "Прикрепить созданный файл к объекту",
  })
  @Transform(valid_bool)
  is_file?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: "Создавать копию PDF",
  })
  @Transform(valid_bool)
  pdfCreate?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Признак: хранить только pdf (после создания pdf уничтожить главный файл, сделав pdf главным)",
  })
  @Transform(valid_bool)
  pdfOnly?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      "Признак: уведомлять о завершении выполнения всех отложенных операций над зависимым файлом (конверация, проверка типа и т.п.)",
  })
  @Transform(valid_bool)
  notifyCompleteDepend?: boolean;

  @Field(() => String, {
    nullable: true,
    description: "Примечание",
  })
  note?: string;
}
