import { Inject, Injectable } from "@nestjs/common";

import { Brackets, DataSource, In, IsNull, MoreThan, Repository } from "typeorm";
import { DocPackageStatus } from "../../common/enum/enum";
import {
  INomenclaturesLevel,
  IRecursiveNomenclature,
} from "../../common/interfaces/nomenclature.interface";
import { customError } from "../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { ArticleEntity } from "../../entity/#organization/article/article.entity";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { NomenclaturesEntity } from "../../entity/#organization/nomenclatures/nomenclatures.entity";
import { excludeDocsFromDocPackage } from "../doc/utils/doc.utils";
import { CopyNomenclaturesArgs } from "./dto/copy-nomenclatures.args";
import { ElementNmnclInput } from "./dto/element-nmncl.input";
import { NomenclatureResponse } from "./dto/get-nomenclature-response.dto";
import { NomenclaturesResponse } from "./dto/get-nomenclatures-response.dto";
import { GetNomenclaturesArgs } from "./dto/get-nomenclatures.args";
import { UpdateNmnclInput } from "./dto/update-nmncl.input";
import { setQueryBuilderNomenclature } from "./nomenclatures.utils";

@Injectable()
export class NomenclaturesService {
  private readonly dataSource: DataSource;
  private readonly nomenclaturesRepository: Repository<NomenclaturesEntity>;
  private readonly articleRepository: Repository<ArticleEntity>;
  private readonly docPackageRepository: Repository<DocPackageEntity>;
  private readonly docRepository: Repository<DocEntity>;

  private readonly ERR_MSG_NOMENCLATURE_NOT_FOUND = "Номенклатура не найдена";

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.nomenclaturesRepository = dataSource.getRepository(NomenclaturesEntity);
    this.articleRepository = dataSource.getRepository(ArticleEntity);
    this.docPackageRepository = dataSource.getRepository(DocPackageEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
  }

  private async getAndCheckNomenclature(id: number): Promise<NomenclaturesEntity> {
    const nmncl = await this.nomenclaturesRepository.findOne({
      relations: {
        Children: {
          Article: { term: true },
        },
        Article: { term: true },
      },
      where: { id, del: false },
    });

    if (!nmncl) {
      customError(this.ERR_MSG_NOMENCLATURE_NOT_FOUND);
    }

    return nmncl;
  }

  /**
   * Получить рекурсивно все эл-ты номенклатуры
   */
  private async recursiveNomenclature(id: number): Promise<IRecursiveNomenclature[]> {
    const nomenclatures: IRecursiveNomenclature[] = await this.nomenclaturesRepository.query(
      `WITH RECURSIVE r AS (
          SELECT id::int,
                 parent_id,
                 name,
                 index,
                 serial_number,
                 nt,
                 storage_comment,
                 article_id,
                 1 AS level
          FROM sad.nomenclatures
          WHERE id = $1 AND del = false

          UNION ALL

          SELECT nmncl.id::int,
                 nmncl.parent_id,
                 nmncl.name,
                 nmncl.index,
                 nmncl.serial_number,
                 nmncl.nt,
                 nmncl.storage_comment,
                 nmncl.article_id,
                 r.level + 1 AS level
          FROM sad.nomenclatures nmncl
          JOIN r ON nmncl.parent_id = r.id AND nmncl.del = false
       )

       SELECT * FROM r;`,
      [id],
    );

    return nomenclatures;
  }

  /**
   * Получение максимального порядкового номера
   */
  private async getMaxSerialNumber(parentId: number): Promise<number> {
    const { maxSerialNumber } = await this.nomenclaturesRepository
      .createQueryBuilder("")
      .select("MAX(serial_number)::int", "maxSerialNumber")
      .where({ parent_id: parentId, del: false })
      .getRawOne();

    return maxSerialNumber;
  }

  /**
   * Проверка на уникальность имени номенклатуры 1-ого уровня
   */
  private async checkUniqueNameParentIsNull(name: string): Promise<void> {
    const count = await this.nomenclaturesRepository.countBy({
      parent_id: IsNull(),
      name,
      del: false,
    });

    if (count) {
      customError(`Номенклатура с именем ${name} уже существует`);
    }
  }

  /**
   * Проверка на уникальность имени и индекса нижестоящей номенклатуры
   */
  private async checkUniqNameAndIndexByParentId(
    parentId: number,
    name: string,
    index: string,
  ): Promise<void> {
    const { checkNameAndIndex } = await this.nomenclaturesRepository
      .createQueryBuilder("nmncl")
      .select("COUNT(DISTINCT nmncl.id)::int", "checkNameAndIndex")
      .where("nmncl.parent_id = :parentId", { parentId })
      .andWhere("nmncl.del = false")
      .andWhere(
        new Brackets((qb) => {
          qb.where("nmncl.name = :name", { name }).orWhere("nmncl.index = :index", {
            index,
          });
        }),
      )
      .getRawOne();

    if (checkNameAndIndex) {
      customError("Номенклатура с данным именем или индексом уже существует");
    }
  }

  /**
   * Проверка статьи хранения
   */
  private async checkArticle(articleId: number): Promise<void> {
    const count = await this.articleRepository.countBy({
      id: articleId,
      del: false,
      temp: false,
    });

    if (!count) {
      customError("Статья хранения с данными параметрами не найдена");
    }
  }

  async addNomenclature(name: number): Promise<NomenclaturesEntity> {
    await this.checkUniqueNameParentIsNull(String(name));
    return this.nomenclaturesRepository.save({ name: String(name) });
  }

  async addElement(elementNmnclInput: ElementNmnclInput): Promise<NomenclaturesEntity> {
    // Имя и индекс номенклатуры - уникальные поля
    await this.checkUniqNameAndIndexByParentId(
      elementNmnclInput.parent_id,
      elementNmnclInput.name,
      elementNmnclInput.index,
    );

    // Проверка вышестоящей номенклатуры
    const parent = await this.nomenclaturesRepository.findOne({
      relations: { Article: { term: true } },
      where: {
        id: elementNmnclInput.parent_id,
        del: false,
      },
    });

    if (!parent) {
      customError("Вышестоящая номенклатура не найдена");
    }

    if (parent.article_id) {
      customError(`Вышестоящая номенклатура ${parent.index} ${parent.name} имеет статью хранения`);
    }

    if (parent.article_id) {
      await this.checkArticle(parent.article_id);
    }

    if (
      !elementNmnclInput.article_id &&
      (elementNmnclInput.nt || elementNmnclInput.storage_comment)
    ) {
      customError(
        `Примечание и комментарий по хранению могут быть добавлены, если указана статья хранения`,
      );
    }

    // Получаем максимальный порядковый номер
    const serialNumber = await this.getMaxSerialNumber(elementNmnclInput.parent_id);
    elementNmnclInput.serial_number = serialNumber + 1;

    // Добавляем ссылку на вышестоящюю номенклатуру 1-ого уровня
    elementNmnclInput.main_parent_id = parent.main_parent_id || parent.id;

    let newIdNmncl: number;
    await this.dataSource.transaction(async (manager) => {
      const { id } = await manager.save(NomenclaturesEntity, elementNmnclInput);
      newIdNmncl = id;

      // Если есть статья хранения, создаём дело на основе этой номенклатуры
      if (elementNmnclInput.article_id) {
        await manager.save(DocPackageEntity, { nomenclature_id: newIdNmncl });
      }
    });

    return this.nomenclaturesRepository.findOne({
      relations: { Article: { term: true } },
      where: { id: newIdNmncl },
    });
  }

  getAllNomenclatures(args: GetNomenclaturesArgs): Promise<NomenclaturesResponse[]> {
    return setQueryBuilderNomenclature(args, this.nomenclaturesRepository);
  }

  async getNomenclature(id: number): Promise<NomenclatureResponse> {
    return this.nomenclaturesRepository.findOne({
      relations: { Article: { term: true } },
      where: { id, del: false },
    });
  }

  async updateNomenclature(updateNmnclInput: UpdateNmnclInput): Promise<NomenclaturesEntity> {
    const nmncl = await this.getAndCheckNomenclature(updateNmnclInput.id);

    // Если номенклатура первого уровня, и новое имя
    if (nmncl.parent_id === null && updateNmnclInput.name && updateNmnclInput.name !== nmncl.name) {
      await this.checkUniqueNameParentIsNull(updateNmnclInput.name);
      nmncl.name = updateNmnclInput.name;
      return this.nomenclaturesRepository.save(nmncl);
    }

    // Если номенклатура - нижестоящая
    if (nmncl.parent_id !== null) {
      // Проверка на уникальность имени и ндекса
      if (
        (updateNmnclInput.name && updateNmnclInput.name !== nmncl.name) ||
        (updateNmnclInput.index && updateNmnclInput.index !== nmncl.index)
      ) {
        // Если значения такие же, то удаляем их, чтобы прошла проверка уникальности
        if (updateNmnclInput.name === nmncl.name) {
          delete updateNmnclInput.name;
        }
        if (updateNmnclInput.index === nmncl.index) {
          delete updateNmnclInput.index;
        }

        await this.checkUniqNameAndIndexByParentId(
          nmncl.parent_id,
          updateNmnclInput.name,
          updateNmnclInput.index,
        );
      }

      if (updateNmnclInput.article_id) {
        await this.checkArticle(updateNmnclInput.article_id);
      }

      if (
        !updateNmnclInput.article_id &&
        !nmncl.article_id &&
        (updateNmnclInput.nt || updateNmnclInput.storage_comment)
      ) {
        customError(
          "Примечание и комментарий по хранению могут быть добавлены, если указана статья хранения",
        );
      }

      // Проверка нижестоящей номенклатуры
      if (
        nmncl.Children[0] &&
        ((updateNmnclInput.article_id && updateNmnclInput.article_id !== nmncl.article_id) ||
          (updateNmnclInput.nt && updateNmnclInput.nt !== nmncl.nt) ||
          (updateNmnclInput.storage_comment &&
            updateNmnclInput.storage_comment !== nmncl.storage_comment))
      ) {
        customError(
          "Статью хранения, примечание, комментарий по хранению нельзя обновлять, т.к. присутствует нижестоящая номенклатура",
        );
      }

      await this.dataSource.transaction(async (manager) => {
        await manager.update(NomenclaturesEntity, updateNmnclInput.id, updateNmnclInput);

        // Если добавляется статья хранения, создаём дело на основе этой номенклатуры
        if (updateNmnclInput.article_id && !nmncl.article_id) {
          await manager.save(DocPackageEntity, {
            nomenclature_id: updateNmnclInput.id,
          });
        }
      });
    }

    return this.nomenclaturesRepository.findOne({
      relations: { Article: { term: true } },
      where: {
        id: updateNmnclInput.id,
        del: false,
      },
    });
  }

  async delete(id: number): Promise<boolean> {
    // При удалении элемента (нижестоящих элементов) необходимо делать проверку на наличие документов в деле.
    // Если в дело уже помещены документы, то они буду исключены из дела.
    // Нельзя удалить элемент, если дело, созданное на основании этого элемента, включено в опись.
    const nmncl = await this.getAndCheckNomenclature(id);
    const nomenclatures = await this.recursiveNomenclature(id);
    const nomenclatureIds = nomenclatures.map((el) => el.id);

    const docPackages = await this.docPackageRepository.find({
      relations: { Nomenclature: true },
      where: {
        nomenclature_id: In(nomenclatureIds),
        del: false,
        Nomenclature: { del: false },
      },
    });

    const docPackagesIncludesInInventory = docPackages.filter((docPackage) => {
      return docPackage.status_id === DocPackageStatus.INCLUDED_IN_INVENTORY;
    });

    if (docPackagesIncludesInInventory[0]) {
      const dp = docPackagesIncludesInInventory[0];
      const nmncl = await dp?.Nomenclature;
      customError(`Дело ${nmncl?.index} ${nmncl?.name} включено в опись`);
    }

    const docPackagesId = docPackages.map((docPackage) => docPackage.id);
    const docs = await this.docRepository.findBy({
      doc_package_id: In(docPackagesId),
      del: false,
      temp: false,
    });

    await this.dataSource.transaction(async (manager) => {
      // Исключаем документы из дела
      await excludeDocsFromDocPackage(docs, docPackages, manager);

      // Удаляем номенклатуру | эл-ты номенклатуры
      await manager.update(
        NomenclaturesEntity,
        {
          id: In(nomenclatureIds),
        },
        {
          del: true,
        },
      );

      // Удаляем дела, которые связанные с номенклатурой
      await manager.update(
        DocPackageEntity,
        {
          nomenclature_id: In(nomenclatureIds),
        },
        {
          del: true,
        },
      );

      // Номенклатура для обновления серийного номера
      const nmnclIds = await manager.find(NomenclaturesEntity, {
        select: { id: true },
        where: {
          parent_id: nmncl.parent_id,
          serial_number: MoreThan(nmncl.serial_number),
          del: false,
        },
        order: { id: 'ASC' },
      });
      const udpateIds = nmnclIds.map((n) => n.id);

      // Обновляем порядковый номер номенклатуры в справочнике
      for await (id of udpateIds) {
        await manager.decrement(
          NomenclaturesEntity,
          {
            id: id,
          },
          "serial_number",
          1,
        );
      }
    });

    return true;
  }

  async copy(copyNomenclaturesArgs: CopyNomenclaturesArgs): Promise<NomenclaturesResponse[]> {
    await this.getAndCheckNomenclature(copyNomenclaturesArgs.id);

    // Проверка уникальности наименования
    await this.checkUniqueNameParentIsNull(String(copyNomenclaturesArgs.name));

    // Рекурсивно достаём эл-ты номенклатуры
    const nomenclatures = await this.recursiveNomenclature(copyNomenclaturesArgs.id);

    // Получаем уровни рекурсии эл-тов номенклатуры
    const levels = [...new Set(nomenclatures.map((el) => el.level))];

    // Создаём массив объектов.
    // В объекте уровень рекурсии и массив номенклатур, соответствующих этому уровню
    const nomenclatureListLevel: INomenclaturesLevel[] = [];

    levels.forEach((level) => {
      const nomenclatureLevelObj = {
        level,
        nomenclatures: nomenclatures.filter((nomenclature) => {
          return nomenclature.level === level;
        }),
      };
      nomenclatureListLevel.push(nomenclatureLevelObj);
    });

    await this.dataSource.transaction(async (manager) => {
      for await (const nomenclaturesLevel of nomenclatureListLevel) {
        for await (const nmncl of nomenclaturesLevel.nomenclatures) {
          // Если есть parent, заменяем его на id новой номенклатуры
          if (nmncl.parent_id) {
            // Для замены parent
            // Получаем вышестоящую номенклатуру
            const levelDownNomenclature = nomenclatureListLevel.find((el) => {
              return el.level === nomenclaturesLevel.level - 1;
            }).nomenclatures;

            // Находим старую номенклатуру
            // и извлекаем новый Id
            const { newId } = levelDownNomenclature.find((el) => {
              return el.id === nmncl.parent_id;
            });

            // Заменяем старый parent на id новой номенклатуры
            nmncl.parent_id = newId;

            // Связываем с номенклатурой 1-ого уровня
            const mailNomenclature = nomenclatureListLevel.find((el) => {
              return el.level === 1;
            }).nomenclatures;

            nmncl.main_parent_id = mailNomenclature[0].newId;
          } else {
            // Если вышестоящей нет, то первый уровень.
            // Заменяем наименование на новое
            nmncl.name = String(copyNomenclaturesArgs.name);
          }

          const { id: newId } = await manager.save(NomenclaturesEntity, {
            parent_id: nmncl.parent_id,
            name: nmncl.name,
            index: nmncl.index,
            serial_number: nmncl.serial_number,
            nt: nmncl.nt,
            storage_comment: nmncl.storage_comment,
            article_id: nmncl.article_id,
            main_parent_id: nmncl.main_parent_id,
          });

          // Если есть статья хранения, создаём дело на основе этой номенклатуры
          if (nmncl.article_id) {
            await manager.save(DocPackageEntity, { nomenclature_id: newId });
          }

          // Сохраняем id новой номенклатуры, для замены старого parent
          nmncl.newId = newId;
        }
      }
    });

    return setQueryBuilderNomenclature({}, this.nomenclaturesRepository);
  }
}
