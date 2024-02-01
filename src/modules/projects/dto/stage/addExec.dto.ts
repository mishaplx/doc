import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql/type";
import { ExecInprojectRouteEntity } from "../../../../entity/#organization/project/execInprojectRoute.entity";

@InputType()
@ObjectType()
export class AddExectDto {
  @Field(() => Int, {
    nullable: true,
    description: "id",
  })
  id: number;

  @Field(() => Int, {
    nullable: false,
    description: "очередь",
  })
  queue: number;

  @Field(() => GraphQLString, {
    nullable: false,
    description: "планованая дата",
  })
  date_plan: Date;

  @Field(() => [Int], {
    nullable: false,
    description: "id исполнителя",
  })
  executor_id: number[];

  @Field(() => String, {
    nullable: true,
    description: "Примечание",
  })
  note: string;

  @Field(() => Int, {
    nullable: false,
    description: "id проекта",
  })
  project_id: number;

  @Field(() => Int, {
    nullable: false,
    description: "id этапа",
  })
  stage_id: number;

  temp: boolean;
}
@InputType()
@ObjectType()
export class UpdateExecProjectDto extends ExecInprojectRouteEntity {
  @Field(() => Int, {
    nullable: true,
    description: "id",
  })
  id: number;

  @Field(() => Int, {
    nullable: false,
    description: "очередь",
  })
  queue: number;

  @Field(() => GraphQLString, {
    nullable: false,
    description: "планованая дата",
  })
  date_plan: Date;

  @Field(() => Int, {
    nullable: false,
    description: "id исполнителя",
  })
  executor_id: number;

  @Field(() => String, {
    nullable: true,
    description: "Примечание",
  })
  note: string;

  @Field(() => Int, {
    nullable: false,
    description: "id проекта",
  })
  project_id: number;

  @Field(() => Int, {
    nullable: false,
    description: "id этапа",
  })
  stage_id: number;

  temp: boolean;
}
