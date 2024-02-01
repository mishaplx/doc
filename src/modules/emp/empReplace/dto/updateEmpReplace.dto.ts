import { InputType, OmitType, PartialType } from "@nestjs/graphql";
import { EmpReplaceEntity } from "../../../../entity/#organization/emp_replace/emp_replace.entity";

@InputType()
export class UpdateEmpReplaceDto extends PartialType(
  OmitType(EmpReplaceEntity, [
    "del",
    "dtc",
    "temp",
    "Emp_who",
    "Emp_whom",
    "date_start",
    "dtc",
    "hasId",
    "post_who",
    "emp_who",
    "emp_whom",
    "post_whom",
  ] as const),
  InputType,
) {}
