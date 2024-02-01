import { Repository } from "typeorm";
import { SortEnum } from "../../common/enum/enum";
import { NomenclaturesEntity } from "../../entity/#organization/nomenclatures/nomenclatures.entity";
import { NomenclaturesResponse } from "./dto/get-nomenclatures-response.dto";
import { GetNomenclaturesArgs } from "./dto/get-nomenclatures.args";

export function setQueryBuilderNomenclature(
  args: GetNomenclaturesArgs,
  nomenclaturesRepository: Repository<NomenclaturesEntity>,
): Promise<NomenclaturesResponse[]> {
  const { parent_id, name, index, nt, storage_comment, article_id } = args;

  const queryBuilder = nomenclaturesRepository
    .createQueryBuilder("nmncl")
    .leftJoinAndSelect("nmncl.Children", "Children", "Children.del = false")
    .leftJoinAndSelect("nmncl.Article", "Article", "Article.del = false AND Article.temp = false")
    .leftJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false")
    .where("nmncl.del = false");

  if (parent_id) {
    queryBuilder
      .andWhere("nmncl.parent_id = :parentId", { parentId: args.parent_id })
      .orderBy("nmncl.serial_number", SortEnum.ASC);
  } else {
    queryBuilder.andWhere("nmncl.parent_id ISNULL").orderBy("nmncl.name", SortEnum.ASC);
  }

  if (name) {
    queryBuilder.andWhere("nmncl.name ILIKE :name", { name: `%${name}%` });
  }

  if (index) {
    queryBuilder.andWhere("nmncl.index ILIKE :index", { index: `%${index}%` });
  }

  if (nt) {
    queryBuilder.andWhere("nmncl.nt ILIKE :nt", { nt: `%${nt}%` });
  }

  if (storage_comment) {
    queryBuilder.andWhere("nmncl.storage_comment ILIKE :storage_comment", {
      storage_comment: `%${storage_comment}%`,
    });
  }

  if (article_id) {
    queryBuilder.andWhere("nmncl.article_id = :article_id", { article_id });
  }

  queryBuilder.addOrderBy("Children.serial_number", SortEnum.ASC);
  return queryBuilder.getMany();
}
