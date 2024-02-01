import { ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import { NomenclaturesEntity } from "../../../entity/#organization/nomenclatures/nomenclatures.entity";

@ObjectType()
export class NomenclatureResponse extends PartialType(
  OmitType(NomenclaturesEntity, ["Children", "del", "serial_number"] as const),
) {}
