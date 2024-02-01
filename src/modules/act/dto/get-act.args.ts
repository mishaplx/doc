import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetActArgs {
  @Field(() => Int, { nullable: true, description: "Id акта" })
  id?: number;

  @Field({ nullable: true, description: "№ Акта" })
  number?: string;

  @Field({ nullable: true, description: "Дата создания" })
  dtc?: Date;

  @Field({ nullable: true, description: "Основание" })
  basis?: string;

  @Field(() => Int, { nullable: true, description: "Количество дел" })
  count_doc_package?: number;

  @Field(() => Int, { nullable: true, description: "Количество документов" })
  count_doc?: number;

  @Field(() => Int, { nullable: true, description: "Количество файлов" })
  count_file?: number;

  @Field(() => Int, { nullable: true, description: "Статус" })
  status_id?: number;
}
