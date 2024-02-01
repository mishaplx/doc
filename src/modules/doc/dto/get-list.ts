import { ArgsType, Field, PartialType } from "@nestjs/graphql";
import { GetDirectoriesArgs } from "../../../common/argsType/get-directories.args";

@ArgsType()
export class GetForwardArgs extends PartialType(GetDirectoriesArgs) {
  @Field()
  doc_id: number;
}
