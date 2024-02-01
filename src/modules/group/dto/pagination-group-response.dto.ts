import { Field, Int, ObjectType } from "@nestjs/graphql";
import { resposneGetGroupe } from "../group.interface";

@ObjectType()
export class PaginatedGroupResponse {
  @Field(() => [resposneGetGroupe])
  data: resposneGetGroupe[];
  @Field(() => metadata)
  metadata: Imetadata;
}
@ObjectType()
class metadata implements Imetadata {
  @Field(() => Int)
  pageNumber: number;
  @Field(() => Int)
  pagesCount: number;
  @Field(() => Int)
  pageSize: number;
  @Field(() => Int)
  recordsNumber: number;
}

interface Imetadata {
  pageNumber: number;
  pagesCount: number;
  pageSize: number;
  recordsNumber: number;
}
