import { OrderTypeJobEnum, SortEnum } from "src/common/enum/enum";
import { TypeJobEntity } from "src/entity/#organization/typeJob/typeJob.entity";
import { SelectQueryBuilder } from "typeorm";
import { GetArgTypeJob } from "./dto/get-arg-type-job";
import { OrderTypeJobInput } from "./dto/order-type-job-request.dto";

export function setQueryBuilderTypeJob(
  args: GetArgTypeJob,
  orderBy: OrderTypeJobInput,
  queryBuilder: SelectQueryBuilder<TypeJobEntity>,
): void {
  const { id, nm, author } = args;

  queryBuilder.leftJoinAndSelect("type_job.DefaultEmp", "DefaultEmp");
  queryBuilder.leftJoinAndSelect("DefaultEmp.User", "User");
  queryBuilder.leftJoinAndSelect("User.Staff", "Staff");
  queryBuilder.leftJoinAndSelect("DefaultEmp.post", "post");
  queryBuilder.where("type_job.del = false");
  queryBuilder.andWhere("type_job.temp = false");

  if (id) {
    queryBuilder.andWhere("type_job.id = :id", { id });
  }

  if (nm) {
    queryBuilder.andWhere("type_job.nm ILIKE :nm", { nm: `%${nm}%` });
  }

  if (author) {
    queryBuilder.andWhere(
      `(Staff.ln || ' ' || Staff.nm || ' ' || CONCAT(Staff.mn) || ' / ' || post.nm) ILIKE :author`,
      {
        author: `%${author}%`,
      },
    );
  }

  getOrderAllUser(queryBuilder, orderBy);
}

function getOrderAllUser(
  queryBuilder: SelectQueryBuilder<TypeJobEntity>,
  orderBy: OrderTypeJobInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("type_job.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderTypeJobEnum.id:
      queryBuilder.orderBy("type_job.id", orderBy.sortEnum);
      break;
    case OrderTypeJobEnum.nm:
      queryBuilder.orderBy("type_job.nm", orderBy.sortEnum);
      break;
    case OrderTypeJobEnum.author:
      queryBuilder.orderBy({
        "Staff.ln": orderBy.sortEnum,
        "Staff.nm": orderBy.sortEnum,
        "Staff.mn": orderBy.sortEnum,
        "post.nm": orderBy.sortEnum,
      });
      break;
    default:
      queryBuilder.orderBy("type_job.id", SortEnum.DESC);
  }
}