import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { SettingEntity } from "../../entity/#organization/setting/setting.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetSystemSettingsArgs } from "./dto/get-systemsettings.args";
import { PaginatedSystemSettingsResponse } from "./dto/paginated-systemsettings-response.dto";
import { UpdateSystemSettingsInput } from "./dto/update-systemsettings.input";
import { SystemSettingsService } from "./settings.service";
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => SettingEntity)
export class SystemSettingsResolver {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => PaginatedSystemSettingsResponse, {
    description: 'Получение справочника "Настройки системы"',
  })
  GetAllSetting(
    @Args() args: GetSystemSettingsArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
  ): Promise<PaginatedSystemSettingsResponse> {
    return this.systemSettingsService.GetAllSetting(args, pagination);
  }

  @UseGuards(DeactivateGuard, PoliceGuard)
  @Query(() => SettingEntity, {
    nullable: true,
    description: 'Просмотр записи справочника "Настройки системы"',
  })
  GetSettingById(@Args("id", { type: () => Int }) id: number): Promise<SettingEntity> {
    return this.systemSettingsService.findOne(id);
  }

  @Query(() => SettingEntity, {
    nullable: true,
    description: 'Просмотр записи справочника "Настройки системы"',
  })
  GetSettingByName(@Args("name", { type: () => String }) name: string): Promise<SettingEntity> {
    return this.systemSettingsService.findOneName(name);
  }

  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => SettingEntity, {
    description: 'Редактирование записи справочника "Настройки системы"',
  })
  updateSetting(
    @Args("updateSystemSettingsInput")
    updateSystemSettingsInput: UpdateSystemSettingsInput,
  ): Promise<SettingEntity> {
    return this.systemSettingsService.updateSetting(
      updateSystemSettingsInput.id,
      updateSystemSettingsInput,
    );
  }
}
