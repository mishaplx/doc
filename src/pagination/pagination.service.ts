import { Field, ObjectType } from "@nestjs/graphql";
import dayjs from "dayjs";
import { Between, ILike, In, Repository } from "typeorm";

import { IPaginatedResponseResult, metadata } from "../common/interfaces/pagination.interface";
import { PaginationInput, PaginationMetadata } from "./paginationDTO";

export function PaginatedResponse<TItem>(TItemClass: TItem): any {
  @ObjectType()
  class PaginatedResponseClass {
    @Field(() => [TItemClass])
    data: TItem[];

    @Field(() => PaginationMetadata)
    metadata: PaginationMetadata;
  }
  return PaginatedResponseClass;
}

interface IListPaginationData<T> {
  repository: Repository<T>;
  where?: any;
  relations?: any;
  pagination?: PaginationInput;
  order?: any;
  filter?: any;
  searchField?: string;
}

/**
 * ПОЛУЧИТЬ СПИСОК
 */
export async function listPaginationData<T>(
  args: IListPaginationData<T>,
): Promise<IPaginatedResponseResult<T>> {
  const { repository, where = {}, relations, pagination, order, filter } = args;

  // допусловия с учетом наличия полей
  const whereCheck = {};
  if (checkColum<T>(repository, "del")) whereCheck["del"] = false;
  if (checkColum<T>(repository, "temp")) whereCheck["temp"] = false;

  // иные условия
  const whereOther = {};

  // сортировка
  if (!order) {
    const primaryColumnName = repository.metadata.primaryColumns[0].propertyName;
    whereOther["order"] = { [primaryColumnName]: "DESC" };
  }

  // сортировка
  if (order?.sortEnum) {
    const key = `${order.value}`;
    order[key] = `${order.sortEnum}`;
    delete order.sortEnum;
    delete order.value;
  }

  const filterWhere = {};
  // фильтрация
  if (filter) {
    delete filter.pagination;
    delete filter.order;
    if (Object.keys(filter).length > 0) {
      for (const [key, value] of Object.entries(filter)) {
        if (typeof value === "string") filterWhere[key] = ILike(`%${value}%`);
        else if (value instanceof Date)
          filterWhere[key] = Between(
            dayjs(value).startOf("day").toISOString(),
            dayjs(value).endOf("day").toISOString(),
          );
        else if (Array.isArray(value)) {
          let idKey;
          if (key === "ids") idKey = "id";
          filterWhere[idKey || key] = In(value);
        } else filterWhere[key] = value;
      }
    }
  }

  // условия в связанных объектах
  if (relations) {
    whereOther["relations"] = relations;
  }

  // условия пагинации
  if (pagination) {
    const { All, pageNumber, pageSize } = pagination;
    if (!All) {
      whereOther["skip"] = (pageNumber - 1) * pageSize;
      whereOther["take"] = pageSize;
    }
  }
  delete args?.searchField;
  const [data, total] = await repository.findAndCount({
    where: {
      ...where,
      ...whereCheck,
      ...filterWhere,
    },
    order,
    ...whereOther,
  });

  const metadata =
    !pagination || pagination?.All
      ? {
          pageNumber: 1,
          pageSize: total,
          pagesCount: 1,
          recordsNumber: total,
        }
      : {
          pageNumber: pagination?.pageNumber,
          pageSize: pagination?.pageSize,
          pagesCount: Math.ceil(total / pagination?.pageSize),
          recordsNumber: total,
        };
  return { data: data, metadata: metadata };
}

// проверка на существование колонки
function checkColum<T>(repository: Repository<T>, nameColum: string): number {
  const arr = repository.metadata.columns.filter((item) => item.propertyName == nameColum);
  return arr.length;
}

/**
 * ПРИ ВОЗМОЖНОСТИ УДАЛИТЬ
 */

/**
 * @deprecated используйте listPaginationData
 */
export async function getPaginatedData<T>(
  repository: Repository<T>,
  pageNumber: number,
  pageSize: number,
  where = {},
  All: boolean,
  relations = null,
  order = null,
): Promise<[T[], number]> {
  // допусловия с учетом наличия полей
  const whereCheck = {};
  if (await checkColum(repository, "del")) whereCheck["del"] = false;
  (await checkColum(repository, "temp")) ? (whereCheck["temp"] = false) : delete where["temp"];
  // допусловия иные условия
  const whereOther = {};
  if (!order) {
    const primaryColumnName = repository.metadata.primaryColumns[0].propertyName;
    whereOther["order"] = { [primaryColumnName]: "DESC" };
  }
  whereOther["relations"] = relations;
  if (!All) {
    whereOther["skip"] = (pageNumber - 1) * pageSize;
    whereOther["take"] = pageSize;
  }

  return repository.findAndCount({
    where: {
      ...where,
      ...whereCheck,
    },
    order,
    ...whereOther,
  });
}
/**
 * @deprecated использвать listPaginationData
 */
export function paginatedResponseResult<T>(
  data: T,
  pageNumber: number,
  pageSize: number,
  total: number,
): {
  metadata: metadata;
  data: T;
} {
  return {
    data,
    metadata: {
      pageNumber,
      pagesCount: Math.ceil(total / pageSize),
      pageSize: pageSize,
      recordsNumber: total,
    },
  };
}
