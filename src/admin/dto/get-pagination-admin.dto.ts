import { ArgsType, ObjectType, PartialType } from "@nestjs/graphql";

import { GetDirectoriesArgs } from "../../common/argsType/get-directories.args";
import { Admin_orgEntity } from "../../entity/#adminBase/admin_org/admin_org.entity";
import { PaginatedResponse } from "../../pagination/pagination.service";

@ObjectType()
export class PaginatedAdminPanelResponse extends PaginatedResponse(Admin_orgEntity) {}

@ArgsType()
export class GetAdminPanelArgs extends PartialType(GetDirectoriesArgs) {
  is_sys: boolean;
}
