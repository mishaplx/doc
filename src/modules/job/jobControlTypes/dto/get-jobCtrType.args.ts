import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetJobCtrTypeArgs {
  @Field({ nullable: true, description: "Наименование" })
  nm?: string;
  @Field({ nullable: true, description: "ID контролера" })
  controller_id?: number;
  @Field({ nullable: true, description: "Имя контролера" })
  controller?: string;
  @Field({ nullable: true, description: "id документа" })
  doc_id?: number;
}
