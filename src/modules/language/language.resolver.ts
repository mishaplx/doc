import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { LanguageEntity } from "../../entity/#organization/language/language.entity";
import { GetLanguageArgs } from "./dto/get-languages-response.dto";
import { LanguageService } from "./language.service";

@Resolver(() => LanguageEntity)
export class LanguageResolver {
  constructor(private readonly languageService: LanguageService) {}

  @Query(() => [LanguageEntity], {
    description: 'Получение справочника "Язык документа"',
  })
  getAllLanguage(@Args() args: GetLanguageArgs): Promise<LanguageEntity[]> {
    return this.languageService.findAll(args);
  }
}
