import { ArgsType, Field, InputType, Int } from "@nestjs/graphql";

@InputType()
@ArgsType()
export class GetInventoryArgs {
  @Field(() => Int, { nullable: true, description: "Id описи" })
  id?: number;

  @Field({ nullable: true, description: "№ описи" })
  number?: string;

  @Field(() => Int, { nullable: true, description: "Наименование описи" })
  inventory_name_id?: number;

  @Field({ nullable: true, description: "Год" })
  inventory_year?: string;

  @Field({ nullable: true, description: "Описание" })
  description?: string;

  @Field(() => Int, { nullable: true, description: "Количество дел" })
  count_doc_package?: number;

  @Field(() => Int, { nullable: true, description: "Статус" })
  status_id?: number;
}
