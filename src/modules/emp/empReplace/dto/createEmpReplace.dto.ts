import { Field, GraphQLISODateTime, InputType, Int } from "@nestjs/graphql";

import { changeDateToEndDay } from "../../emp.utils";

interface ICreateEmpReplace {
  userWho: number;
  postWho: number;
  userWhom: number;
  postWhom: number;
  date_start: Date;
  date_end: Date;
}
@InputType("CreateEmpReplaceDto")
export class CreateEmpReplaceDto implements ICreateEmpReplace {
  @Field(() => Int)
  userWho: number;

  @Field(() => Int)
  postWho: number;

  @Field(() => Int)
  userWhom: number;

  @Field(() => Int)
  postWhom: number;

  @Field(() => GraphQLISODateTime, {
    description: "дата замены С какого числа",
    nullable: false,
    middleware: [changeDateToEndDay],
  })
  date_start: Date;

  @Field(() => GraphQLISODateTime, {
    description: "дата замены С какого числа",
    nullable: false,
    middleware: [changeDateToEndDay],
  })
  date_end: Date;
}
//user + post == emp
