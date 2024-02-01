import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ForwardingEntity } from "../../../entity/#organization/forwarding/forwarding.entity";
import { PaginationInput, defaultPaginationValues } from "../../../pagination/paginationDTO";
import { GetForwardArgs } from "../dto/get-list";
import { PaginatedForwardListResponse } from "../dto/pagination-forward-list.dto";
import { ForwardingService } from "./forwarding.service";

// передача\пересылка
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver()
export class ForwardingResolver {
  constructor(private forwardServ: ForwardingService) {}

  @Query(() => PaginatedForwardListResponse)
  getAllForwardingList(
    @Args() args: GetForwardArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
  ) {
    return this.forwardServ.getAllForwardingList(args, pagination);
  }

  @Query(() => ForwardingEntity, {
    description: "получить передачу\\пересылку по id",
  })
  getForwardById(@Args("id") id: number) {
    return this.forwardServ.getForwardById(id);
  }
  @Mutation(() => [ForwardingEntity], {
    description:
      "В рамках операции происходит добавление получателя (получателей) по передаче/пересылке.",
  })
  addReceiver(
    @Token() token: IToken,
    @Args("note", {
      nullable: true,
    })
    note: string,
    @Args("doc_id") doc_id: number,
    @Args("emp_receiver", {
      type: () => [Int],
    })
    emp_receiver: [number],
    @Args("forward_view") forward_view: number,
    @Args("is_notify_emp_creator", {
      nullable: true,
      defaultValue: false,
    })
    is_notify_emp_creator: boolean,
  ): Promise<ForwardingEntity[] | HttpException> {
    return this.forwardServ.addReceiver(
      token,
      note,
      doc_id,
      emp_receiver,
      forward_view,
      is_notify_emp_creator,
    );
  }

  @Mutation(() => ForwardingEntity, {
    description: "Завершение по пересылке",
  })
  closeForwarding(
    @Args("id_forwarding", {
      type: () => Int,
    })
    id_forwarding: number,
    @Args("comment_end", { nullable: true }) comment_end: string,
    @Token() token: IToken,
  ): Promise<ForwardingEntity | HttpException> {
    return this.forwardServ.closeForwarding(id_forwarding, token, comment_end);
  }
  @Mutation(() => Boolean, {
    description: "Удаление пересылки",
  })
  deleteForwarding(
    @Args("id_forwarding", {
      type: () => Int,
    })
    id_forwarding: number,
  ): Promise<boolean> {
    return this.forwardServ.deleteForwarding(id_forwarding);
  }
}
