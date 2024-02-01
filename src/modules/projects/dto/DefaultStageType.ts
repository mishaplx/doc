import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType("prod_route")
@ObjectType("Project_route_actionTypeObj")
export class Project_route_actionType {
  @Field(() => Int)
  id!: number;

  @Field(() => Boolean, {
    description: "флаг действия",
    nullable: true,
  })
  flag: boolean;

  @Field(() => String, {
    description: "наименование действия",
    nullable: true,
  })
  name: string;
}
