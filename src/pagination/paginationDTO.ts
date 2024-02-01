import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PaginationMetadata {
  @Field(() => Int, { description: "Номер страницы" })
  pageNumber: number;

  @Field(() => Int, { description: "" })
  pagesCount: number;

  @Field(() => Int, { description: "" })
  pageSize: number;

  @Field(() => Int, { description: "Количество всего записей в системе" })
  recordsNumber: number;

  @Field(() => Boolean, {
    defaultValue: false,
    description: "Все записи без пагинации",
  })
  All: boolean;
}

@InputType("PaginationInput", { description: "Пагинация" })
@ArgsType()
export class PaginationInput {
  @Field(() => Int, {
    defaultValue: 1,
    description: "Номер страницы",
  })
  pageNumber?: number;

  @Field(() => Int, {
    defaultValue: 10,
    description: "Количество записей на странице",
  })
  pageSize?: number;

  @Field(() => Boolean, {
    defaultValue: false,
    description: "Все записи без пагинации",
  })
  All?: boolean;
}

/**
 * @deprecated FIXME: Можно удалить за ненадобности P.S. После удаления 43 -error
 *
 */
export const defaultPaginationValues = {
  pageNumber: 1,
  pageSize: 15,
};

// FIXME: В идеале включить бы в PaginatedResponse, но не везде используется
@ArgsType()
export class IdsDto {
  @Field(() => [Int], {
    description: "список id записей (при наличии поля id - приоритет id)",
  })
  ids?: number[];
}
