import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { OrderCatalogEnum } from "../../common/enum/enum";
import { searchAllColumnWithoutRelation } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { PostEntity } from "../../entity/#organization/post/post.entity";
import { getPaginatedData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { CreatePostInput } from "./dto/create-post.input";
import { GetPostArgs } from "./dto/get-post.args";
import { PaginatedPostResponse } from "./dto/paginated-post-response.dto";
import { UpdatePostInput } from "./dto/update-post.input";
import { getWhereFindAllPost } from "./post.utils";

@Injectable()
export class PostService {
  private readonly postRepository: Repository<PostEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.postRepository = dataSource.getRepository(PostEntity);
  }

  async create(createPostInput: CreatePostInput): Promise<PostEntity> {
    const newPost = this.postRepository.create(createPostInput);
    return await this.postRepository.save(newPost);
  }

  async findAll(
    args: GetPostArgs,
    pagination: PaginationInput,
    orderBy: OrderCatalogInput,
    searchField: string,
  ): Promise<PaginatedPostResponse> {
    const where = getWhereFindAllPost(args);
    const { pageNumber, pageSize, All } = pagination;

    const order = orderBy?.value === OrderCatalogEnum.nm ? { nm: orderBy.sortEnum } : null;
    if (searchField?.trim()) {
      const [post, total] = await searchAllColumnWithoutRelation(
        this.postRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(post, pageNumber, pageSize, total);
    }
    const [positions, total] = await getPaginatedData(
      this.postRepository,
      pageNumber,
      pageSize,
      where,
      All,
      null,
      order,
    );

    return paginatedResponseResult(positions, pageNumber, pageSize, total);
  }

  findOne(id: number): Promise<PostEntity> {
    return this.postRepository.findOneBy({ id });
  }

  async update(id: number, updatePostInput: UpdatePostInput): Promise<PostEntity> {
    await this.postRepository.update(id, updatePostInput);
    return this.postRepository.findOneByOrFail({ id });
  }

  async remove(id: number): Promise<boolean> {
    const { affected } = await this.postRepository.update(id, { del: true });
    return !!affected;
  }
}
