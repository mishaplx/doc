import { Field, InputType, OmitType } from "@nestjs/graphql";
import { TypeJobEntity } from "../../../../entity/#organization/typeJob/typeJob.entity";

@InputType("CreateTypeOrgDto", { isAbstract: true })
export class CreateTypeOrgDto extends OmitType(TypeJobEntity, ["id"]) {
  @Field({ nullable: true })
  nm: string;
  @Field({ nullable: true })
  default_emp_id?: number;
}
