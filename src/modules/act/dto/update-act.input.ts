import { Field, InputType, Int } from "@nestjs/graphql";
import { GraphQLString } from "graphql";

@InputType()
export class UpdateActInput {
  @Field(() => Int, { description: "Id акта" })
  id: number;

  @Field({ nullable: true, description: "№ Акта" })
  number: string;

  @Field({ nullable: true, description: "Основание" })
  basis: string;

  @Field({ nullable: true, description: "№ ЭМК" })
  number_emk: string;

  @Field(() => GraphQLString, { nullable: true, description: "Дата ЭМК" })
  date_emk: Date;

  @Field(() => [Int], { nullable: true, description: "Id дел" })
  docPackages: number[];

  count_doc_package?: number;
  count_doc?: number;
  count_file?: number;
  start_date?: Date;
  end_date?: Date;
}
