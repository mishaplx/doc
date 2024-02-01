import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class UpdateRoleInput {
  @Field(() => Int, { description: "Id роли" })
  id: number;

  @Field({ nullable: true, description: "Наименование роли" })
  name: string;

  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Field({ nullable: true, description: "Флаг блокировки" })
  locked: boolean;

  @Field(() => [Int], { nullable: true, description: "Id операций" })
  operations: number[];

  @Field(() => [Int], { nullable: true, description: "Id пункта меню" })
  menuOps: number[];
}
