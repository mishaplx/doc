import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateEmpInput } from "./create-emp.input";

@InputType()
export class UpdateEmpInput extends PartialType(CreateEmpInput) {
  @Field(() => Int, { description: "Id текущего назначения" })
  id!: number;
}
