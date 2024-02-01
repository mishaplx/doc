import { ObjectType } from "@nestjs/graphql";
import { SettingEntity } from "../../../entity/#organization/setting/setting.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedSystemSettingsResponse extends PaginatedResponse(SettingEntity) {}
