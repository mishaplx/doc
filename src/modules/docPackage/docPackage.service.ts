import { Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import path from "path";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { SignEntity } from "src/entity/#organization/sign/sign.entity";
import { DataSource, In, Not, QueryRunner, Repository } from "typeorm";
import { create } from "xmlbuilder2";

import { DocPackageStatus, SortEnum } from "../../common/enum/enum";
import { customError } from "../../common/type/errorHelper.type";
import {
  globalSearchBuilderdocPackage,
} from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { createFileMainUtil } from "../file/fileCreate/fileCreate.utils";
import { bufferToStream } from "../file/utils/file.common.utils";
import { signAddUtil } from "../sign/utils/sign.utils";
import { checkRkkFormatPDF, generationConcatenatedHash, generationHash, getFilesForInnerInventory, setQueryBuilderDocPackage } from "./docPackage.utils";
import { GetDocPackagesArgs } from "./dto/get-doc-packages.args";
import { OrderDocPackagesInput } from "./dto/order-doc-packages-request.dto";
import { PaginatedDocPackagesResponse } from "./dto/paginated-doc-packages-response.dto";

@Injectable()
export class DocPackageService {
  private readonly dataSource: DataSource;
  private readonly docPackageRepository: Repository<DocPackageEntity>;
  private readonly docRepository: Repository<DocEntity>;
  private readonly fileRepository: Repository<FileItemEntity>;

  private readonly ERR_MSG_DOC_PACKAGE_NOT_FOUND = "Дело не найдено";
  private readonly ERR_MSG_DOC_PACKAGE_STATUS = "Недопустимый статус дела";
  private readonly INNER_INVENTORY_XSD = path.join(__dirname, '..', '..', 'file', 'xsd', 'innerInventory.xsd');
  private readonly NAME_INNER_INVENTORY_FILE = "Внутренняя опись.xml";

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.docPackageRepository = dataSource.getRepository(DocPackageEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
    this.fileRepository = dataSource.getRepository(FileItemEntity);
  }

  async findAll(
    args: GetDocPackagesArgs,
    pagination: PaginationInput,
    orderBy: OrderDocPackagesInput,
    searchField: string,
  ): Promise<PaginatedDocPackagesResponse> {
    const queryBuilder = this.docPackageRepository.createQueryBuilder("doc_package");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchBuilderdocPackage(queryBuilder, searchField);
    } else {
      setQueryBuilderDocPackage(args, orderBy, queryBuilder);
    }

    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }

    const [docPackages, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(docPackages, pageNumber, pageSize, total);
  }

  async formInnerInventory(ids: number[], token: IToken): Promise<boolean> {
    // Получаем дело
    const docPackages = await this.docPackageRepository
      .createQueryBuilder("doc_package")
      .select()
      .innerJoinAndSelect("doc_package.Nomenclature", "Nmncl", "Nmncl.del = false")
      .innerJoinAndSelect(
        "Nmncl.Article",
        "Article",
        "Article.del = false AND Article.temp = false",
      )
      .innerJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false")
      .where("doc_package.id IN (:...ids)", { ids })
      .andWhere("doc_package.del = false")
      .getMany();

    if (docPackages.length !== ids.length) {
      customError(this.ERR_MSG_DOC_PACKAGE_NOT_FOUND);
    }

    await this.dataSource.transaction(async (manager) => {
      for await (const dp of docPackages) {
        if (
          [DocPackageStatus.INCLUDED_IN_INVENTORY, DocPackageStatus.INCLUDED_IN_ACT].includes(
            dp.status_id,
          )
        ) {
          const nmncl = await dp.Nomenclature;
          customError(`Дело ${nmncl.index} ${nmncl.name}, недопустимый статус.`);
        }

        // Док-ты дела
        const docs = await this.docRepository.find({
          where: {
            doc_package_id: dp.id,
            del: false,
            temp: false,
          },
          order: { serial_number: SortEnum.ASC },
        });

        if (!docs.length) {
          const nmncl = await dp.Nomenclature;
          customError(`Дело ${nmncl.index} ${nmncl.name}, отсутствуют документы.`);
        }

        if (docs.length !== dp.count_doc) {
          const nmncl = await dp.Nomenclature;
          customError(`Дело ${nmncl.index} ${nmncl.name}, несоответствие: количество документов.`);
        }

        const docsId = docs.map((doc) => doc.id);
        const arrRkk = await this.fileRepository.find({
          relations: {
            FileVersion: {
              FileBlock: {
                Doc: true,
              },
            },
          },
          where: {
            FileVersion: {
              FileBlock: {
                doc_id: In(docsId),
                rkk: true
              },
            },
          },
        });
        // Проверяем ркк. Они должны быть формата - пдф
        await checkRkkFormatPDF(arrRkk);

        // Подготавливаем файлы для описи
        const files = await getFilesForInnerInventory(token.url, docs, manager);

        // Формируем xml
        const root = create({ version: "1.0", encoding: "UTF-8" });
        const innerInventory = root.ele("InnerInventory");
        innerInventory.ele("CountDoc").txt(String(dp.count_doc));
        innerInventory.ele("CountFile").txt(String(dp.count_file));
        // Объём файлов
        const countVolumeDoc = files.reduce((total, file) => total + file.size, 0);
        innerInventory.ele("CountVolumeDoc").txt(String(countVolumeDoc));
        const listElectronicDocuments = innerInventory.ele("ListElectronicDocuments");
        // Контрольная характеристика файлов предыдущего документа
        let prevEDHashFiles = '';
        // Контрольная характеристика карточки предыдущего документа (ркк)
        let prevEDHash = '';
        for await (const doc of docs) {
          // Файлы и ркк док-та
          const currentFiles = files.filter((file) => file.docId === doc.id);
          // Массив адресов файлов документа
          const docFilesPath = [];
          // Адрес ркк
          let rccPath = '';
          // Объем документа (Байт)
          let volumeFileDocument = 0;
          for await (const file of currentFiles) {
            if (file.rkk) {
              rccPath = file.path;
            } else {
              docFilesPath.push(file.path);
            }
            volumeFileDocument += file.size;
          }
          // Контрольная характеристика документа
          const hashED = await generationHash(token.url, docFilesPath);
          // Контрольная характеристика ркк
          const hashEDMetadata = rccPath ? await generationConcatenatedHash([rccPath]) : '';

          const createTs = dayjs(doc.dr).format("YYYY-MM-DD HH:mm:ss");

          const electronicDocument = listElectronicDocuments.ele("ElectronicDocument");
          electronicDocument.ele("NumEDinArch").txt(String(doc.serial_number));
          electronicDocument.ele("CreateTs").txt(createTs);
          electronicDocument.ele("Title").txt(doc.header);
          electronicDocument.ele("CountFileED").txt(String(currentFiles.length));
          electronicDocument.ele("VolumeFileDocument").txt(String(volumeFileDocument));
          electronicDocument.ele("PrevEDHashFiles").txt(prevEDHashFiles);
          electronicDocument.ele("PrevEDHash").txt(prevEDHash);
          electronicDocument.ele("HashED").txt(hashED);
          electronicDocument.ele("HashEDMetadata").txt(hashEDMetadata);
          electronicDocument.ele("NoteED").txt(doc.nt);
          prevEDHashFiles = hashED;
          prevEDHash = hashEDMetadata;
        }
        const xml = root.end({ prettyPrint: true });
        const buffer = Buffer.from(xml);

        // Сохраняем внутреннюю опись
        await createFileMainUtil({
          manager,
          files: [
            {
              stream: bufferToStream(buffer),
              originalname: this.NAME_INNER_INVENTORY_FILE,
            },
          ],
          param: {
            idDocPackage: dp.id,
          },
          token,
          file_block_one: true,
          file_version_one: true,
        });

        await manager.update(DocPackageEntity, dp.id, {
          status_id: DocPackageStatus.INNER_INVENTORY_FORMED,
        });
      }
    });

    return true;
  }

  async signInnerInventory(id: number, sign: string, emp: number): Promise<boolean> {
    const docPackage = await this.docPackageRepository.findOne({
      relations: { FileBlock: { FileVersionMain: true } },
      where: { id, del: false },
    });

    if (!docPackage) {
      customError(this.ERR_MSG_DOC_PACKAGE_NOT_FOUND);
    }

    if (![
      DocPackageStatus.INNER_INVENTORY_FORMED,
      DocPackageStatus.INNER_INVENTORY_SIGN,
    ].includes(docPackage.status_id)) {
      customError(this.ERR_MSG_DOC_PACKAGE_STATUS);
    }

    const file = await (await docPackage?.FileBlock)?.FileVersionMain;
    if (!file?.FileItemMain?.volume) customError("Не найдена внутрення опись, id дела: " + id);

    const fileItemEntity = file.FileItemMain;

    let affected;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Добавляем подпись
      const signItem = await signAddUtil({
        manager: queryRunner.manager,
        sign,
        emp_id: emp,
        file_item_id: fileItemEntity.id,
      });

      // Меняем статус дела
      affected = await queryRunner.manager.update(DocPackageEntity, { id }, {
        status_id: DocPackageStatus.INNER_INVENTORY_SIGN,
      });

      // Удаляем старые подписи
      await queryRunner.manager.delete(SignEntity, {
        id: Not(signItem.id),
        file_item_id: fileItemEntity.id,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      customError(error.message);
    } finally {
      await queryRunner.release();
    }

    return !!affected;
  }
}
