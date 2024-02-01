import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { AuditEntity } from "../../entity/#organization/audit/audit.entity";
import { PaginationInput } from "../../pagination/paginationDTO";
import { AuditService } from "./audit.service";
import { GetAuditOperationsArgs } from "./dto/get-audit-operations.args";
import { GetAuditArgs } from "./dto/get-audit.args";
import { OrderAuditOperationsInput } from "./dto/order-audit-operations-request.dto";
import { OrderAuditInput } from "./dto/order-audit-request.dto";
import { PaginatedAuditOperationsResponse } from "./dto/paginated-audit-operations-response.dto";
import { PaginatedAuditResponse } from "./dto/paginated-audit-response.dto";
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => AuditEntity)
export class AuditResolver {
  constructor(private auditService: AuditService) {}

  /**
   * Список аудита
   */
  @Query(() => PaginatedAuditResponse, {
    description: "Аудит",
  })
  @UseGuards(PoliceGuard)
  async getAudit(
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderAuditInput,
    @Args() args?: GetAuditArgs,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedAuditResponse | HttpException> {
    return this.auditService.get(pagination, order, args, searchField);
  }

  @UseGuards(PoliceGuard)
  @Query(() => Boolean, {
    description: "Очистка Аудита",
  })
  async clearAudit() {
    return await this.auditService.clearAudit();
  }

  /**
   * Список операций аудита
   */
  @Query(() => PaginatedAuditOperationsResponse, {
    description: "Список операций аудита",
  })
  async getAuditOperations(
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderAuditOperationsInput,
    @Args() args?: GetAuditOperationsArgs,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedAuditOperationsResponse | HttpException> {
    return this.auditService.getOperations(pagination, order, args, searchField);
  }

  /**
   * GET
   */
  @UseGuards(PoliceGuard)
  @Query(() => [Int], {
    description: "Просмотр включенных операций аудита",
  })
  async getAuditEnabledOperations(): Promise<number[] | HttpException> {
    return this.auditService.getAuditEnabledOperations();
  }

  /**
   * SET
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: "Включить заданные операции аудита",
  })
  async setAuditEnabledOperations(
    @Args("audit_operation_ids", {
      type: () => [Int],
      description: "Массив ID Из списка операций аудита",
    })
    audit_operation_ids: number[],
  ): Promise<boolean | HttpException> {
    return this.auditService.setAuditEnabledOperations(audit_operation_ids);
  }
}
