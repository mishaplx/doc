import { Field, GraphQLISODateTime, InputType, Int, PartialType } from "@nestjs/graphql";
// import { GraphQLString } from 'graphql/type';

@InputType()
export class CorrespondentCreate {
  @Field(() => Int, { description: "id документа" })
  doc_id: number;

  @Field(() => Int, { description: "id организации", nullable: true })
  org_id: number;

  @Field(() => Int, { description: "id физ лица", nullable: true })
  citizen_id: number;

  @Field(() => GraphQLISODateTime, { description: "Дата отправки" })
  outd: Date;

  @Field({ nullable: true, description: "Id способа отправки" })
  delivery_id: number;

  emp_id_author: number;
  del: boolean;
  is_main: boolean;
}

@InputType()
export class CorrespondentUpdate extends PartialType(CorrespondentCreate) {
  @Field(() => Int)
  id!: number;
}
