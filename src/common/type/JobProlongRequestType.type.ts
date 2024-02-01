import { Field, ObjectType } from "@nestjs/graphql";
import { ExecJobEntity } from "../../entity/#organization/job/jobExec.entity";
import { JobProlongRequestEntity } from "../../entity/#organization/job/jobProlongRequest.entity";

@ObjectType({ description: "Запросы на продление поручения" })
export class JobProlongRequestType {
  @Field(() => [JobProlongRequestEntity], {
    description: "данные по продлению",
  })
  data: JobProlongRequestEntity[];

  @Field({ description: "Все данные по Исполнителю" })
  ObjExecJob: ExecJobEntity;
}
