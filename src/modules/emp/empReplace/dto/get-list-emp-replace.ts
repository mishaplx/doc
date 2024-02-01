import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetListEmpReplace {
  @Field(() => Int, { nullable: true, description: "Должность" })
  post?: number;

  @Field({ nullable: true, description: "Заменяемый" })
  emp_whom?: string;

  @Field({ nullable: true, description: "Заменяющий" })
  emp_who?: string;

  @Field({ nullable: true, description: "Дата с" })
  date_start?: Date;

  @Field({ nullable: true, description: "Табельный номер" })
  personnal_number?: string;

  @Field({ nullable: true, description: "Дата по" })
  date_end?: Date;
}
