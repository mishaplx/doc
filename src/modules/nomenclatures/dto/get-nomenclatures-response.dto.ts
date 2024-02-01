import { ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import { NomenclaturesEntity } from "../../../entity/#organization/nomenclatures/nomenclatures.entity";

@ObjectType()
export class NomenclaturesResponse extends PartialType(
  OmitType(NomenclaturesEntity, ["del", "serial_number"] as const),
) {}
