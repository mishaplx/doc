import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DashboardService } from "./dashboard.service";
import { DashboardStatisticsResponse } from "./dto/dashboard-statistics-response.dto";
@UseGuards(DeactivateGuard)
@Resolver()
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  @Query(() => DashboardStatisticsResponse)
  getStatisticsForDashboard(@Token() token: IToken): Promise<DashboardStatisticsResponse> {
    return this.dashboardService.statistics(token.current_emp_id);
  }
}
