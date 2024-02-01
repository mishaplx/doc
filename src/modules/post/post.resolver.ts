import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { PostEntity } from "../../entity/#organization/post/post.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { CreatePostInput } from "./dto/create-post.input";
import { GetPostArgs } from "./dto/get-post.args";
import { PaginatedPostResponse } from "./dto/paginated-post-response.dto";
import { UpdatePostInput } from "./dto/update-post.input";
import { PostService } from "./post.service";

@UseGuards(DeactivateGuard)
@Resolver(() => PostEntity)
export class PostResolver {
  constructor(private postService: PostService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => PostEntity, {
    description: 'Добавление записи в справочник "Должности"',
  })
  createPost(@Args("createPostInput") createPostInput: CreatePostInput): Promise<PostEntity> {
    return this.postService.create(createPostInput);
  }

  @Query(() => PaginatedPostResponse, {
    description: 'Получение справочника "Должности"',
  })
  getAllPost(
    @Args() args: GetPostArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderCatalogInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedPostResponse> {
    return this.postService.findAll(args, pagination, order, searchField);
  }

  @Query(() => PostEntity, {
    nullable: true,
    description: 'Получение записи справочника "Должности"',
  })
  post(@Args("id", { type: () => Int }) id: number): Promise<PostEntity> {
    return this.postService.findOne(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => PostEntity, {
    description: 'Редактирование записи справочника "Должности"',
  })
  updatePost(@Args("updatePostInput") updatePostInput: UpdatePostInput): Promise<PostEntity> {
    return this.postService.update(updatePostInput.id, updatePostInput);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Должности"',
  })
  removePost(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.postService.remove(id);
  }
}
