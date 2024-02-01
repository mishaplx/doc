import { ArgsType, PartialType } from "@nestjs/graphql";
import { GetDirectoriesArgs } from "../../../common/argsType/get-directories.args";

@ArgsType()
export class GetDeliverysArgs extends PartialType(GetDirectoriesArgs) {}
