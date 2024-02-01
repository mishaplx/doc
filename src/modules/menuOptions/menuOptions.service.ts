import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { MenuOptionsEntity } from "../../entity/#organization/role/menuOptions.entity";
import { GetMenuOptionsArgs } from "./dto/get-menu-options.args";
import { setQueryBuilderMenuOptions } from "./menuOptions.utils";

@Injectable()
export class MenuOptionsService {
  private readonly menuOptionsRepository: Repository<MenuOptionsEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.menuOptionsRepository = dataSource.getRepository(MenuOptionsEntity);
  }

  async findAll(args: GetMenuOptionsArgs): Promise<MenuOptionsEntity[]> {
    const queryBuilder = this.menuOptionsRepository.createQueryBuilder("menu_options");
    setQueryBuilderMenuOptions(args, queryBuilder);

    return queryBuilder.getMany();
  }
}
