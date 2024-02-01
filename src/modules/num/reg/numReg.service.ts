import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource, In, Not } from "typeorm";

import { DeliveryEnum, DocStatus } from "../../doc/doc.const";
import { APIErrorCodeEnum } from "../../../BACK_SYNC_FRONT/enum/enum.api";
import { customError, validError } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { SmdoPackagesEntity } from "../../../entity/#organization/smdo/smdo_packages.entity";
import { SmdoService } from "../../../smdo/smdo.service";
import { runNumGenerateUtil } from "../generate/numGenerate.util";
import { getDataSourceAdmin } from "../../../database/datasource/tenancy/tenancy.utils";
import { PREF_ERR } from "src/common/enum/enum";

const ERR = "Регистрация: ошибка ";

@Injectable()
export class NumRegService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) { }

  /**
   * НУМЕРАТОР: РЕГИСТРАЦИЯ
   * @param reg_num_is (boolean) - использовать нумератор (счетчик)
   * @param reg_num_custom (string) - номер для регистрации от пользователя
   * @param ignore_unique (boolean) - игнорировать уникальность комбинации (дата регистрации, номер и тип документа)
   *
   * регистрационный номер может быть сгенерирован (reg_num_is=true), но не использован (если задан reg_num_custom)
   */
  async regDoc(args: {
    emp_id: number;
    doc_id: number;
    reg_num_is?: boolean;
    reg_num_custom?: string;
    ignore_unique?: boolean;
    reserved_counter?: number;
  }): Promise<string | HttpException> {
    try {
      const {
        emp_id,
        doc_id,
        reg_num_is = true,
        reg_num_custom,
        ignore_unique = false,
        reserved_counter,
      } = args;
      let reg_num_custom_ = reg_num_custom?.trim();
      if (reg_num_custom_ == '') reg_num_custom_ = undefined;
      let reg_num = "";

      // ошибка: одновременно не заданы использование нумератора и номер регистрации от пользователя
      if (!reg_num_is && !reg_num_custom_) {
        customError('Некорректный запрос');
      }

      await this.dataSource.transaction(async (manager) => {
        // Получить документ
        const docEntity = await manager.findOneOrFail(DocEntity, {
          where: {
            id: doc_id,
            del: false,
          },
        });

        // Если документ уже зарегистрирован - ошибка
        if (!["", undefined, null].includes(docEntity.reg_num)) {
          customError("Документ ранее зарегистрирован под номером: " + docEntity.reg_num);
        }

        // Сгенерировать регистрационный номер ( может не использоваться если задан reg_num_custom )
        if (reg_num_is) {
          const reg_num_0 = await runNumGenerateUtil({
            manager: manager,
            emp_id: emp_id,
            doc_id: doc_id,
            reserved_counter: reserved_counter,
          });
          validError(reg_num_0);
          reg_num = String(reg_num_0);
        }

        // Взять предложенный пользователем номер
        if (reg_num_custom_) {
          reg_num = reg_num_custom_;
        }

        // Комбинация (дата регистрации, номер и тип документа) не должны повторяться
        // проверка под админом вне транзакции
        // при совпадении ошибка и откат транзациии в т.ч. состояния нумератора (счетчиков)
        const dataSourceAdmin = await getDataSourceAdmin(this.dataSource.options.database as string);
        const reg_data = new Date();
        if (!ignore_unique) {
          if (await dataSourceAdmin.manager.countBy(DocEntity, {
            reg_num: reg_num,
            dr: docEntity.dr,
            cls_id: docEntity.cls_id,
            del: false,
            docstatus: Not(In([DocStatus.NEWDOC.id, DocStatus.INREGISTRATE.id])),
          })) {
            throw new HttpException(
              PREF_ERR+'Документ с комбинацией (дата регистрации, номер и тип документа) уже существует',
              APIErrorCodeEnum.doc_reg_exist
            );
          };
        }

        // Обновить документ
        await manager.update(DocEntity, doc_id, {
          reg_num: reg_num,
          dr: reg_data,
          docstatus: DocStatus.REGISTRATE.id,
        });

        if (docEntity.delivery == DeliveryEnum.SMDO) {
          // Получить пакет СМДО
          const smdoPackage = await manager.findOneOrFail(SmdoPackagesEntity, {
            where: { docId: doc_id },
          });
          // Отправить квитанцию о регистрации в СМДО
          await new SmdoService(this.dataSource).sendAcknowledge(
            smdoPackage.smdoId,
            "ACCEPT",
            manager,
          );
        }
      });
      return reg_num;
    } catch (err) {
      return customError(ERR + "регистрации документа", err);
    }
  }
}
