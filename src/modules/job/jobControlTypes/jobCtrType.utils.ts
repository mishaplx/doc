import { OrderControlTypesEnum, SortEnum } from "src/common/enum/enum";
import { JobsControlTypesEntity } from "src/entity/#organization/job/jobControlTypes.entity";
import { SelectQueryBuilder } from "typeorm";
import { GetJobCtrTypeArgs } from "./dto/get-jobCtrType.args";
import { OrderControlTypesInput } from "./dto/order-control-types-request.dto";

export function setQueryBuilderJobsControlTypes(
  args: GetJobCtrTypeArgs,
  orderBy: OrderControlTypesInput,
  queryBuilder: SelectQueryBuilder<JobsControlTypesEntity>,
): void {
  const { nm, controller } = args;

  queryBuilder.leftJoinAndSelect("jobs_control_types.Controller", "Controller");
  queryBuilder.leftJoinAndSelect("Controller.User", "User");
  queryBuilder.leftJoinAndSelect("User.Staff", "Staff");
  queryBuilder.leftJoinAndSelect("Controller.post", "post");
  queryBuilder.where("jobs_control_types.del = false");
  queryBuilder.andWhere("jobs_control_types.temp = false");

  if (nm) {
    queryBuilder.andWhere("jobs_control_types.nm ILIKE :nm", { nm: `%${nm}%` });
  }

  if (controller) {
    queryBuilder.andWhere(
      `(Staff.ln || ' ' || Staff.nm || ' ' || CONCAT(Staff.mn) || ' / ' || post.nm) ILIKE :controller`,
      {
        controller: `%${controller}%`,
      },
    );
  }

  getOrderAllUser(queryBuilder, orderBy);
}

function getOrderAllUser(
  queryBuilder: SelectQueryBuilder<JobsControlTypesEntity>,
  orderBy: OrderControlTypesInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("jobs_control_types.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderControlTypesEnum.nm:
      queryBuilder.orderBy("jobs_control_types.nm", orderBy.sortEnum);
      break;
    case OrderControlTypesEnum.controller:
      queryBuilder.orderBy({
        "Staff.ln": orderBy.sortEnum,
        "Staff.nm": orderBy.sortEnum,
        "Staff.mn": orderBy.sortEnum,
        "post.nm": orderBy.sortEnum,
      });
      break;
    default:
      queryBuilder.orderBy("jobs_control_types.id", SortEnum.DESC);
  }
}
