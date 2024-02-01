import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { SignEntity } from "../../../entity/#organization/sign/sign.entity";
import { SignCrudService } from "./sign.crud.service";

@UseGuards(DeactivateGuard)
@Resolver(() => SignEntity)
export class SignCrudResolver {
  constructor(private signCrudService: SignCrudService) {}

  /********************************************
   * ЭЦП: ДОБАВИТЬ ПОДПИСЬ
   ********************************************/
  @Mutation(() => SignEntity, {
    description: "ЭЦП: добавить подпись",
  })
  async signAdd(
    @Token()
    token: IToken,

    @Args("file_item_id", {
      type: () => Int,
      description: "id файла item",
      nullable: true,
    })
    file_item_id: number,

    @Args("project_id", {
      description: "id проекта документа",
      type: () => Int,
      nullable: true,
    })
    project_id: number,

    @Args("doc_id", {
      description: "id документа",
      type: () => Int,
      nullable: true,
    })
    doc_id: number,

    @Args("job_id", {
      description: "id поручения",
      type: () => Int,
      nullable: true,
    })
    job_id: number,

    @Args("inventory_id", {
      description: "id описи",
      type: () => Int,
      nullable: true,
    })
    inventory_id: number,

    @Args("sign", {
      type: () => String,
      nullable: false,
      description: "ЭЦП в PEM-формате",
    })
    sign: string,
  ): Promise<SignEntity | HttpException> {
    return this.signCrudService.signAdd({
      sign: sign,
      emp_id: token.current_emp_id,
      file_item_id: file_item_id,
      project_id: project_id,
      doc_id: doc_id,
      job_id: job_id,
      inventory_id: inventory_id,
    });
  }
}
