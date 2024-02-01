import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class createJobsDTO {
  @Field({ nullable: false })
  id: number;

  @Field({ nullable: false, description: "id документа" })
  docId: number;
}
