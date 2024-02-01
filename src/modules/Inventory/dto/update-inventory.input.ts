import { Field, InputType, Int, OmitType } from "@nestjs/graphql";
import { GetInventoryArgs } from "./get-inventory.args";

@InputType()
export class UpdateInventoryInput extends OmitType(GetInventoryArgs, [
  "inventory_year",
  "count_doc_package",
  "status_id",
] as const) {
  @Field(() => Int, { description: "Id описи" })
  id: number;

  @Field({ nullable: true, description: "Подразделение" })
  unit: string;

  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Field(() => [Int], { nullable: true, description: "Id дел" })
  docPackages: number[];

  count_doc_package?: number;
  year?: string;
  status_id?: number;
  count_doc?: number;
  start_date?: Date;
  end_date?: Date;
}
