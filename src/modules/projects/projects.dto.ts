import { ArgsType, Field } from "@nestjs/graphql";
import { Transform } from "class-transformer";

import { valid_int } from "../../common/utils/utils.dto";

@ArgsType()
export class projectsStageRemarkDto {
  @Field(() => Number, {
    nullable: false,
    description: "ID проекта",
  })
  @Transform(valid_int)
  idProject: number;

  @Field(() => Number, {
    nullable: false,
    description: "ID этапа",
  })
  @Transform(valid_int)
  idStage: number;

  @Field(() => String, {
    nullable: true,
    description: "Замечание",
  })
  remark?: string;

  file?: string;
}

@ArgsType()
export class projectsStageRevisionDto {
  @Field(() => Number, {
    nullable: false,
    description: "ID проекта",
  })
  @Transform(valid_int)
  idProject: number;

  @Field(() => Number, {
    nullable: false,
    description: "ID этапа",
  })
  @Transform(valid_int)
  idStage: number;

  @Field(() => String, {
    nullable: true,
    description: "Замечание",
  })
  remark?: string;
}
