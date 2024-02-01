import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { SettingEntity } from "../../entity/#organization/setting/setting.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetSystemSettingsArgs } from "./dto/get-systemsettings.args";
import { PaginatedSystemSettingsResponse } from "./dto/paginated-systemsettings-response.dto";
import { UpdateSystemSettingsInput } from "./dto/update-systemsettings.input";
import { getWhereFindAllSystemSettings } from "./settings.util";

@Injectable()
export class SystemSettingsService {
  private readonly systemSettingsRepository: Repository<SettingEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.systemSettingsRepository = dataSource.getRepository(SettingEntity);
  }
  async GetAllSetting(
    args: GetSystemSettingsArgs,
    pagination: PaginationInput,
  ): Promise<PaginatedSystemSettingsResponse> {
    const where = getWhereFindAllSystemSettings(args);
    const { pageNumber, pageSize, All } = pagination;

    const [systemSettings, total] = await getPaginatedData(
      this.systemSettingsRepository,
      pageNumber,
      pageSize,
      where,
      All,
    );

    return paginatedResponseResult(systemSettings, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<SettingEntity> {
    return this.systemSettingsRepository.findOneBy({ id });
  }

  findOneName(name: string): Promise<SettingEntity> {
    return this.systemSettingsRepository.findOneBy({ name });
  }

  async updateSetting(
    id: number,
    updateSystemSettingsInput: UpdateSystemSettingsInput,
  ): Promise<SettingEntity> {
    await this.systemSettingsRepository.update(id, updateSystemSettingsInput);
    return this.systemSettingsRepository.findOneByOrFail({ id });
  }
}
