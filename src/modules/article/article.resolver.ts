import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { ArticleEntity } from "../../entity/#organization/article/article.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { ArticleService } from "./article.service";
import { CreateArticleInput } from "./dto/create-article.input";
import { GetArticleArgs } from "./dto/get-articles.args";
import { OrderArticleInput } from "./dto/order-article-request.dto";
import { PaginatedArticleResponse } from "./dto/paginated-article-response.dto";
import { UpdateArticleInput } from "./dto/update-article.input";
@UseGuards(DeactivateGuard)
@Resolver(() => ArticleEntity)
export class ArticleResolver {
  constructor(private articleService: ArticleService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => ArticleEntity, {
    description: 'Добавление записи в справочник "Статьи хранения"',
  })
  createArticle(
    @Args("createArticleInput") createArticleInput: CreateArticleInput,
  ): Promise<ArticleEntity> {
    return this.articleService.create(createArticleInput);
  }

  @Query(() => PaginatedArticleResponse, {
    description: 'Получение справочника "Статьи хранения"',
  })
  getAllArticle(
    @Args() args: GetArticleArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderArticleInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedArticleResponse> {
    return this.articleService.findAll(args, pagination, order, searchField);
  }

  @Query(() => ArticleEntity, {
    nullable: true,
    description: 'Получение записи справочника "Статьи хранения"',
  })
  article(@Args("id", { type: () => Int }) id: number): Promise<ArticleEntity> {
    return this.articleService.findOne(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => ArticleEntity, {
    description: 'Редактирование записи справочника "Статьи хранения"',
  })
  updateArticle(
    @Args("updateArticleInput") updateArticleInput: UpdateArticleInput,
  ): Promise<ArticleEntity> {
    return this.articleService.update(updateArticleInput.id, updateArticleInput);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Статьи хранения"',
  })
  removeArticle(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.articleService.remove(id);
  }
}
