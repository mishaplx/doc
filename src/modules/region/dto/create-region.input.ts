import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateRegionInput {
  @Field({ description: "Наименование региона" })
  nm: string;
}
