import { Inject, Injectable } from "@nestjs/common";
import { customError } from "../../common/type/errorHelper.type";
import { NomenclaturesEntity } from "src/entity/#organization/nomenclatures/nomenclatures.entity";
import { DataSource, Repository } from "typeorm";

import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { ArticleEntity } from "../../entity/#organization/article/article.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getOrderFindAllArticle, getWhereFindAllArticle } from "./article.utils";
import { CreateArticleInput } from "./dto/create-article.input";
import { GetArticleArgs } from "./dto/get-articles.args";
import { OrderArticleInput } from "./dto/order-article-request.dto";
import { PaginatedArticleResponse } from "./dto/paginated-article-response.dto";
import { UpdateArticleInput } from "./dto/update-article.input";

@Injectable()
export class ArticleService {
  private readonly articleRepository: Repository<ArticleEntity>;
  private readonly nomenclaturesRepository: Repository<NomenclaturesEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.articleRepository = dataSource.getRepository(ArticleEntity);
    this.nomenclaturesRepository = dataSource.getRepository(NomenclaturesEntity);
  }

  async create(createArticleInput: CreateArticleInput): Promise<ArticleEntity> {
    const newArticle = this.articleRepository.create(createArticleInput);
    const { id } = await this.articleRepository.save(newArticle);
    return this.articleRepository.findOne({
      relations: { term: true },
      where: { id },
    });
  }

  async findAll(
    args: GetArticleArgs,
    pagination: PaginationInput,
    orderBy: OrderArticleInput,
    searchField?: string,
  ): Promise<PaginatedArticleResponse> {
    const where = getWhereFindAllArticle(args);
    const order = getOrderFindAllArticle(orderBy);
    const relation = { term: true };
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      const [article, total] = await searchAllColumnWithoutRelation(
        this.articleRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(article, pageNumber, pageSize, total);
    }
    const [article, total] = await getPaginatedData(
      this.articleRepository,
      pageNumber,
      pageSize,
      where,
      All,
      relation,
      order,
    );

    return paginatedResponseResult(article, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<ArticleEntity> {
    return this.articleRepository.findOne({
      relations: { term: true },
      where: { id },
    });
  }

  async update(id: number, updateArticleInput: UpdateArticleInput): Promise<ArticleEntity> {
    await this.articleRepository.update(id, updateArticleInput);
    return this.articleRepository.findOneOrFail({
      relations: { term: true },
      where: { id },
    });
  }

  async remove(id: number): Promise<boolean> {
    const nmncl = await this.nomenclaturesRepository.findOneBy({
      article_id: id,
      del: false,
    });
    if (nmncl) {
      customError("Статья хранения используется в номенклатуре");
    }
    const { affected } = await this.articleRepository.delete(id);
    return !!affected;
  }
}
