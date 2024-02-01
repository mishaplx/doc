import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { NomenclaturesEntity } from "../../entity/#organization/nomenclatures/nomenclatures.entity";
import { CopyNomenclaturesArgs } from "./dto/copy-nomenclatures.args";
import { ElementNmnclInput } from "./dto/element-nmncl.input";
import { NomenclatureResponse } from "./dto/get-nomenclature-response.dto";
import { NomenclaturesResponse } from "./dto/get-nomenclatures-response.dto";
import { GetNomenclaturesArgs } from "./dto/get-nomenclatures.args";
import { UpdateNmnclInput } from "./dto/update-nmncl.input";
import { NomenclaturesService } from "./nomenclatures.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class NomenclaturesResolver {
  constructor(private nomenclaturesService: NomenclaturesService) {}

  @Mutation(() => NomenclaturesEntity, { description: "Добавить номенклатуру" })
  addNomenclature(@Args("name", { type: () => Int }) name: number): Promise<NomenclaturesEntity> {
    return this.nomenclaturesService.addNomenclature(name);
  }

  @Mutation(() => NomenclaturesEntity, {
    description: "Добавить нижестоящую номенклатуру",
  })
  addElementNomenclature(
    @Args() elementNmnclInput: ElementNmnclInput,
  ): Promise<NomenclaturesEntity> {
    return this.nomenclaturesService.addElement(elementNmnclInput);
  }

  @Query(() => [NomenclaturesResponse], {
    description: "Получение списка номенклатур | эл-тов номенклатуры",
  })
  getAllNomenclatures(@Args() args: GetNomenclaturesArgs): Promise<NomenclaturesResponse[]> {
    return this.nomenclaturesService.getAllNomenclatures(args);
  }

  @Query(() => NomenclatureResponse, {
    description: "Получение определённой номенклатуры",
    nullable: true,
  })
  getNomenclatureById(@Args("id", { type: () => Int }) id: number): Promise<NomenclatureResponse> {
    return this.nomenclaturesService.getNomenclature(id);
  }

  @Mutation(() => NomenclaturesEntity, {
    description: "Изменение номенклатуры | эл-та номенклатуры",
  })
  updateNomenclature(@Args() updateNmnclInput: UpdateNmnclInput): Promise<NomenclaturesEntity> {
    return this.nomenclaturesService.updateNomenclature(updateNmnclInput);
  }

  @Mutation(() => Boolean, {
    description: "Удалить номенклатуру",
    nullable: true,
  })
  deleteNomenclature(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.nomenclaturesService.delete(id);
  }

  @Mutation(() => [NomenclaturesResponse], {
    description: "Копировать номенклатуру",
    nullable: true,
  })
  copyNomenclature(
    @Args() copyNomenclaturesArgs: CopyNomenclaturesArgs,
  ): Promise<NomenclaturesResponse[]> {
    return this.nomenclaturesService.copy(copyNomenclaturesArgs);
  }
}
