import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { LanguageEntity } from "../../entity/#organization/language/language.entity";
import { GetLanguageArgs } from "./dto/get-languages-response.dto";
import { setQueryBuilderLanguage } from "./language.utils";

@Injectable()
export class LanguageService {
  private readonly languageRepository: Repository<LanguageEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.languageRepository = dataSource.getRepository(LanguageEntity);
  }

  findAll(args: GetLanguageArgs): Promise<LanguageEntity[]> {
    return setQueryBuilderLanguage(args, this.languageRepository);
  }
}
