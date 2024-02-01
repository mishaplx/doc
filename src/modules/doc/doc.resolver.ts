import { HttpException, Req, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Request } from "express";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { DocInput, FindAllDocType } from "../../common/type/FindAllDocType.type";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { PrivEntity } from "../../entity/#organization/priv/priv.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { DocService } from "./doc.service";
import { GetDocumentsArgs } from "./dto/get-documents.args";
import { OrderDocInput } from "./dto/order-doc-request.dto";
import { PaginatedDocResponse } from "./dto/paginated-documents-response.dto";
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => [FindAllDocType])
export class DocResolver {
  constructor(private docServ: DocService) {}

  @Query(() => [PrivEntity])
  priv(): Promise<PrivEntity[]> {
    return this.docServ.getAllPriv();
  }
  @Query(() => Int)
  checkDublicateDocRegistrate(
    @Args("input", {
      description: "Новые данные документа",
    })
    input: DocInput,
  ): Promise<number> {
    return this.docServ.checkDublicateDocRegistrate(input);
  }

  @Query(() => PaginatedDocResponse, {
    description: "Получение списка документов",
  })
  getAllDoc(
    @Token() token: IToken,
    @Args() args: GetDocumentsArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderDocInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedDocResponse> {
    return this.docServ.getAllDoc(args, token.current_emp_id, pagination, order, searchField);
  }

  /**
   * Получение документа по id
   * @param id
   * @param token
   */
  @Query(() => DocEntity, {
    description: "Получение документа по id",
  })
  findByIdDoc(
    @Args("id", {
      type: () => Int,
      description: "id документа",
    })
    id: number,
    @Token() token: IToken,
  ): Promise<DocEntity> {
    return this.docServ.FindByIdDoc(id, token);
  }

  /**
   * Создание нового документа
   * @param token
   * @param cls класс документа
   */
  @Mutation(() => DocEntity, {
    description: "Создание нового документа",
  })
  //@UseGuards(PoliceGuard)
  createDoc(
    @Token() token: IToken,

    @Args("cls", {
      type: () => Int,
      description:
        "Класс документа cls=1 ---- Входящий, cls=2 ---- Исходящий, cls=3 ---- Внутренний, cls=4 ---- Обращения",
    })
    cls: number,
  ): Promise<DocEntity> {
    return this.docServ.createDoc(cls, token.current_emp_id);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: "Направить документ в дело",
  })
  sendDocToDocPackage(
    @Token() token: IToken,
    @Args("docId", { type: () => Int, description: "Id документа" }) docId: number,
    @Args("docPackageId", {
      type: () => Int,
      nullable: true,
      description: "Id дела",
    })
    docPackageId: number,
    @Args("fileIds", {
      type: () => [Int],
      description: "Id файлов",
    })
    fileIds: number[],
  ): Promise<boolean> {
    return this.docServ.sendDocToDocPackage(token, docId, docPackageId, fileIds);
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: "Исключить документы из дела",
  })
  excludeDocs(
    @Args("ids", { type: () => [Int], description: "Id документов" })
    docIds: number[],
  ): Promise<boolean> {
    return this.docServ.excludeDocs(docIds);
  }

  /**
   * Обновление документа
   * @param auto_num флаг автоматического проставления номера
   * @param nomenclature_division id раздела номенклатуры
   * @param nomenclature_index id индекса дела номенклатуры
   * @param input новые данные документа
   * @param flagButton
   * @param token
   * @param req
   */

  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => DocEntity, {
    description: "Обновление документа\n\nрегистрационный номер может быть сгенерирован (regNumIs=true), но не использован (если задан regNumCustom)",
  })
  async updateDoc(
    @Args("auto_num", { defaultValue: true }) auto_num: boolean,
    @Args("nomenclature_division", { defaultValue: 1 })
    nomenclature_division: number,
    @Args("nomenclature_index", { defaultValue: 2 }) nomenclature_index: number,
    @Args("input", {
      description: "Новые данные документа",
    })
    input: DocInput,

    @Args("regNumIs", {
      nullable: true,
      defaultValue: true,
      description: "Использовать нумератор (счетчик)",
    })
    regNumIs: boolean,

    @Args("ignore_unique", {
      type: () => Boolean,
      nullable: true,
      description: "Игнорировать уникальность комбинации (дата регистрации, номер и тип документа)",
    })
    ignore_unique: boolean,

    @Args("flagButton", {
      nullable: true,
      description: "1 - сохранить, 2 - зарегистрировать, 3 - не подлежит регистрации",
    })
    flagButton: number,

    @Token() token: IToken,
    @Req() req: Request,
  ): Promise<DocEntity | HttpException> {
    return await this.docServ.updateDoc(
      auto_num,
      nomenclature_division,
      nomenclature_index,
      input,
      regNumIs,
      ignore_unique,
      flagButton,
      token,
      req,
    );
  }

  @UseGuards(PoliceGuard)
  @Mutation(() => DocEntity, {
    description: "кнопки завершения обработки",
  })
  async endWorkDoc(
    @Args("id", { type: () => Int, description: "Id документов" }) id: number,
  ): Promise<DocEntity | HttpException> {
    return await this.docServ.endWorkDoc(id);
  }
  // кнопки завершения обработки

  @Mutation(() => Boolean, {
    description: "Отправить документ по электронной почте",
  })
  sendMail(
    @Args("docId", { type: () => Int, description: "Id документа" }) docId: number,
    @Args("corrIds", { type: () => [Int], description: "Id корреспондентов" })
    corrIds: number[],
    @Args("fileIds", {
      type: () => [Int],
      nullable: true,
      description: "Id файлов",
    })
    fileIds: number[],
    @Args("rkk", {
      nullable: true,
      description: "ркк",
    })
    rkk: boolean,
    @Token() token: IToken,
  ): Promise<boolean> {
    return this.docServ.sendMail(docId, corrIds, fileIds, rkk, token.url, token.current_emp_id);
  }
}
