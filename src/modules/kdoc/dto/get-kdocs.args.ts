import { ArgsType, PartialType } from "@nestjs/graphql";
import { GetDirectoriesArgs } from "../../../common/argsType/get-directories.args";

@ArgsType()
export class GetKdocsArgs extends PartialType(GetDirectoriesArgs) {}
