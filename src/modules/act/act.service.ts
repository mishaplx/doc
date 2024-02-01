import { Inject, Injectable } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { SignEntity } from "../../entity/#organization/sign/sign.entity";
import { DataSource, In, Not, QueryRunner, Repository } from "typeorm";
import { ActStatus, DocPackageStatus } from "../../common/enum/enum";
import { customError } from "../../common/type/errorHelper.type";
import { globalSearchBuilderAct } from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { ActEntity } from "../../entity/#organization/act/act.entity";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { DocPackageDeletedEntity } from "../../entity/#organization/docPackageDeleted/docPackageDeleted.entity";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { getDocPackageForStatistics } from "../docPackage/docPackage.utils";
import { getPathVolume } from "../file/utils/file.volume.utils";
import { signAddUtil } from "../sign/utils/sign.utils";
import { filesDeleter, formDocumentAct, queryBuilderActById, setQueryBuilderAct } from "./act.utils";
import { GetActArgs } from "./dto/get-act.args";
import { OrderActInput } from "./dto/order-act-request.dto";
import { PaginatedActResponse } from "./dto/paginated-act-response.dto";
import { UpdateActInput } from "./dto/update-act.input";

@Injectable()
export class ActService {
  private readonly dataSource: DataSource;
  private readonly actRepository: Repository<ActEntity>;
  private readonly docPackageDeletedRepository: Repository<DocPackageDeletedEntity>;

  private readonly ERR_MSG_ACT = "Акт не найден";
  private readonly ERR_MSG_ACT_STATUS = "Недопустимый статус акта";

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.actRepository = dataSource.getRepository(ActEntity);
    this.docPackageDeletedRepository = dataSource.getRepository(DocPackageDeletedEntity);
  }

  async findAll(
    args: GetActArgs,
    pagination: PaginationInput,
    orderBy: OrderActInput,
    searchField: string,
  ): Promise<PaginatedActResponse> {
    const queryBuilder = this.actRepository.createQueryBuilder("act");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchBuilderAct(queryBuilder, searchField);
    } else {
      setQueryBuilderAct(args, orderBy, queryBuilder);
    }
    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [docPackages, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(docPackages, pageNumber, pageSize, total);
  }

  findById(id: number): Promise<ActEntity> {
    return queryBuilderActById(id, this.actRepository);
  }

  async create(userId: number): Promise<number> {
    const { id } = await this.actRepository.save({ author_id: userId });
    return id;
  }

  async update(id: number, updateActInput: UpdateActInput, token: IToken): Promise<ActEntity> {
    const dataSource = await getDataSourceAdmin(token.url);
    try {
      await dataSource.transaction(async (manager) => {
        const act = await manager.findOneBy(ActEntity, { id, del: false });

        if (!act) {
          customError(this.ERR_MSG_ACT);
        }

        if (act.status_id === ActStatus.DOC_PACKAGE_DELETED) {
          customError(this.ERR_MSG_ACT_STATUS);
        }

        // Проверка на уникальность номера акта
        if (updateActInput?.number && updateActInput.number !== act.number) {
          const isNumberAct = await manager.countBy(ActEntity, {
            number: updateActInput.number,
            del: false,
          });

          if (isNumberAct) {
            customError(`Номер ${updateActInput.number} уже используется`);
          }
        }

        // Дела доступные для добавления:
        // - не включены в опись;
        // - не включены в другой акт;
        // - сформирована и подписана внутренняя опись.
        if (Array.isArray(updateActInput.docPackages)) {
          // Убираем старую связь дел с актом
          await manager.update(
            DocPackageEntity,
            { act_id: id },
            {
              status_id: DocPackageStatus.INNER_INVENTORY_SIGN,
              act_id: null,
            },
          );

          const docPackagesId = updateActInput.docPackages;
          const docPackages = await getDocPackageForStatistics(docPackagesId, manager);

          if (docPackages.length !== docPackagesId.length) {
            customError("Некорректные дела.");
          }

          let countDocPackage = 0;
          let countDoc = 0;
          let countFile = 0;
          let startDate = null;
          let endDate = null;

          if (updateActInput?.docPackages?.[0]) {
            const dateArr: Date[] = [];

            for await (const docPackage of docPackages) {
              const docs = await docPackage.Docs;
              countDoc += docs.length;
              for await (const doc of docs) {
                dateArr.push(doc.dr);
                countFile += (await doc.FileBlock).length;
              }
            }

            countDocPackage = docPackages.length;
            startDate = new Date(Math.min(...dateArr.map((date) => new Date(date).getTime())));
            endDate = new Date(Math.max(...dateArr.map((date) => new Date(date).getTime())));
          }

          updateActInput.count_doc_package = countDocPackage;
          updateActInput.count_doc = countDoc;
          updateActInput.count_file = countFile;
          updateActInput.start_date = startDate;
          updateActInput.end_date = endDate;

          // Связываем дела с актом
          await manager.update(
            DocPackageEntity,
            { id: In(updateActInput.docPackages) },
            {
              status_id: DocPackageStatus.INCLUDED_IN_ACT,
              act_id: id,
            },
          );
        }

        // Обновляем акт
        await manager.update(ActEntity, id, {
          number: updateActInput.number,
          basis: updateActInput.basis,
          number_emk: updateActInput.number_emk,
          date_emk: updateActInput.date_emk,
          count_doc_package: updateActInput.count_doc_package,
          count_doc: updateActInput.count_doc,
          count_file: updateActInput.count_file,
          start_date: updateActInput.start_date,
          end_date: updateActInput.end_date,
          status_id: ActStatus.NEW,
          temp: false,
        });

        // Формируем данные акта, для подписания
        await formDocumentAct(id, manager, token);
      });
    } catch (err) {
      customError(err?.message);
    }

    return queryBuilderActById(id, this.actRepository);
  }

  async delete(id: number): Promise<boolean> {
    const act = await this.actRepository.findOneBy({ id, del: false });

    if (!act) {
      customError(this.ERR_MSG_ACT);
    }

    if (act.status_id !== ActStatus.NEW) {
      customError(this.ERR_MSG_ACT_STATUS);
    }

    await this.dataSource.transaction(async (manager) => {
      // При удалении, дела исключаются из акта.
      await manager.update(
        DocPackageEntity,
        {
          act_id: id,
        },
        {
          act_id: null,
          status_id: DocPackageStatus.INNER_INVENTORY_SIGN,
        },
      );

      await manager.update(ActEntity, id, { del: true });
    });

    return true;
  }

  async sign(id: number, sign: string, userId: number): Promise<boolean> {
    const act = await this.actRepository.findOne({
      relations: { FileBlock: { FileVersionMain: true } },
      where: { id, del: false },
    });

    if (!act) {
      customError(this.ERR_MSG_ACT);
    }

    if (act.status_id === ActStatus.DOC_PACKAGE_DELETED) {
      customError(this.ERR_MSG_ACT_STATUS);
    }

    if (!act.count_doc_package) {
      customError("Отсутствуют дела");
    }

    const file = await (await act?.FileBlock)?.FileVersionMain;
    if (!file?.FileItemMain?.volume) customError("Не найден документ акта");

    const fileItemEntity = file.FileItemMain;

    let affected;

    try {
      await this.dataSource.transaction(async (manager) => {
        // Добавляем подпись
        const signItem = await signAddUtil({
          manager: manager,
          sign,
          emp_id: userId,
          file_item_id: fileItemEntity.id,
        });

        // Меняем статус акта
        affected = await manager.update(ActEntity, { id }, {
          status_id: ActStatus.SIGN,
        });

        // Удаляем старые подписи
        await manager.delete(SignEntity, {
          id: Not(signItem.id),
          file_item_id: fileItemEntity.id,
        });
      });
    } catch (err) {
      customError(err?.message);
    }

    return !!affected;
  }

  async deleteDocPackageByAct(id: number, userId: number, context: any): Promise<boolean> {
    const act = await queryBuilderActById(id, this.actRepository);

    if (!act) {
      customError(this.ERR_MSG_ACT);
    }

    if (act.status_id !== ActStatus.SIGN) {
      customError(this.ERR_MSG_ACT_STATUS);
    }

    const docPackagesId: number[] = [];
    const docsId: number[] = [];
    const fileBlocks: FileBlockEntity[] = [];
    const docPackagesDeleted: DocPackageDeletedEntity[] = [];
    const pathFiles: string[] = [];

    await this.dataSource.transaction(async (manager) => {
      // Сохраняем инф-цию по удаляемым делам
      const docPackages = await act.DocPackages;
      for await (const dp of docPackages) {
        const nmcl = await dp.Nomenclature;
        docPackagesId.push(dp.id);
        const docs = await dp.Docs;
        for await (const doc of docs) {
          docsId.push(doc.id);
          fileBlocks.push(...(await doc.FileBlock));
        }
        docPackagesDeleted.push(
          this.docPackageDeletedRepository.create({
            year: Number((await nmcl.MainParent).name),
            index: nmcl.index,
            title: nmcl.name,
            start_date: dp.start_date,
            end_date: dp.end_date,
            count_doc: dp.count_doc,
            count_file: dp.count_file,
            storage_period: (await (await nmcl.Article).term).nm,
            article_storage: (await nmcl.Article).nm,
            comment: nmcl.storage_comment,
            nt: nmcl.nt,
            act_id: dp.act_id,
          }),
        );
      }

      manager.save(DocPackageDeletedEntity, docPackagesDeleted);

      //Получаем пути файлов, для последующего удаления
      const nameOrg = context.req.headers.org.toLowerCase();
      for await (const fileBlock of fileBlocks) {
        for await (const fileVersion of await fileBlock.FileVersions) {
          for await (const fileItem of await fileVersion.FileItems) {
            pathFiles.push(getPathVolume(nameOrg, fileItem.date_create, fileItem.volume));
          }
        }
      }

      // Удаляем файлы из таблицы
      await manager.remove(FileBlockEntity, fileBlocks);
      // Удаляем документы
      await manager.update(DocEntity, { id: In(docsId) }, { del: true });
      // Удаляем дела
      await manager.update(DocPackageEntity, { id: In(docPackagesId) }, { del: true });
      // Меняем статус акта
      await manager.update(ActEntity, { id: act.id }, {
        delete_doc_package_user_id: userId,
        date_delete_doc_package: new Date(),
        status_id: ActStatus.DOC_PACKAGE_DELETED,
      });
    });

    // Удаляем файлы с носителя
    filesDeleter(pathFiles);
    return true;
  }
}
