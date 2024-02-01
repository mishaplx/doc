import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateStaffInput } from "./create-staff.input";

@InputType()
export class UpdateStaffInput extends PartialType(CreateStaffInput) {
  @Field(() => Int, { description: "Id сотрудника" })
  id!: number;
}
