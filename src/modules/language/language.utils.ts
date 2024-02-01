import { Repository } from "typeorm";
import { SortEnum } from "../../common/enum/enum";
import { LanguageEntity } from "../../entity/#organization/language/language.entity";
import { GetLanguageArgs } from "./dto/get-languages-response.dto";

export function setQueryBuilderLanguage(
  args: GetLanguageArgs,
  languageRepository: Repository<LanguageEntity>,
): Promise<LanguageEntity[]> {
  const { id, nm, char_code_ru, char_code_en, digit_code } = args;

  const queryBuilder = languageRepository
    .createQueryBuilder("language")
    .where("language.del = false");

  if (id) {
    queryBuilder.andWhere("language.id = :id", { id });
  }

  if (nm) {
    queryBuilder.andWhere("language.nm ILIKE :nm", { nm: `%${nm}%` });
  }

  if (char_code_ru) {
    queryBuilder.andWhere("language.char_code_ru ILIKE :char_code_ru", {
      char_code_ru: `%${char_code_ru}%`,
    });
  }

  if (char_code_en) {
    queryBuilder.andWhere("language.char_code_en ILIKE :char_code_en", {
      char_code_en: `%${char_code_en}%`,
    });
  }

  if (digit_code) {
    queryBuilder.andWhere("language.digit_code ILIKE :digit_code", {
      digit_code: `%${digit_code}%`,
    });
  }

  queryBuilder.orderBy("language.nm", SortEnum.ASC);

  return queryBuilder.getMany();
}
