import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateOrgInput } from "./create-org.input";

@InputType()
export class UpdateOrgInput extends PartialType(CreateOrgInput) {
  @Field(() => Int, {
    nullable: true,
    description: "id smdo организации",
  })
  idOrgSmdo: number;

  @Field(() => Int, {
    description: "id организации которую  нужно обновить",
  })
  idOrg!: number;
}
