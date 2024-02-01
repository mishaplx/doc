import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class MetadataType {
  @Field({ nullable: true })
  page: number;
  @Field({ nullable: true })
  pages: number;
  @Field({ nullable: true })
  records: number;
}
