import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { MenuOptionsEntity } from "../../entity/#organization/role/menuOptions.entity";
import { GetMenuOptionsArgs } from "./dto/get-menu-options.args";
import { MenuOptionsService } from "./menuOptions.service";
@UseGuards(DeactivateGuard)
@Resolver(() => MenuOptionsEntity)
export class MenuOptionsResolver {
  constructor(private readonly menuOptionsService: MenuOptionsService) {}

  @Query(() => [MenuOptionsEntity], {
    description: 'Получение справочника "Пункты Меню"',
  })
  getAllMenuOptions(@Args() args: GetMenuOptionsArgs): Promise<MenuOptionsEntity[]> {
    return this.menuOptionsService.findAll(args);
  }
}
