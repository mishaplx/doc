import { HttpException, Inject, Injectable, UseGuards } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ResponseType } from "../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { CorrespondentEntity } from "../../entity/#organization/correspondent/correspondent.entity";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { CorrespondentCreate, CorrespondentUpdate } from "./dto/correspondentDTO";

@Injectable()
@UseGuards(PoliceGuard)
export class CorrespondentService {
  private readonly correspondentsRepository: Repository<CorrespondentEntity>;
  private readonly orgRepository: Repository<OrgEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.correspondentsRepository = dataSource.getRepository(CorrespondentEntity);
    this.orgRepository = dataSource.getRepository(OrgEntity);
  }

  async getCorrespondentsByDoc(docId: number): Promise<CorrespondentEntity[]> {
    return await this.correspondentsRepository.find({
      where: {
        doc_id: docId,
      },
    });
  }

  async addCorrespondent(
    correspondentItem: CorrespondentCreate,
    token: IToken,
  ): Promise<CorrespondentEntity> {
    correspondentItem.emp_id_author = token.current_emp_id;
    correspondentItem.del = false;
    correspondentItem.is_main = false;

    const newCorrespondent = this.correspondentsRepository.create(correspondentItem);
    newCorrespondent.org = correspondentItem.org_id;
    await newCorrespondent.save();
    return newCorrespondent;
  }

  async updateCorrespondent(
    correspondentId: number,
    correspondentItem: CorrespondentUpdate,
  ): Promise<CorrespondentEntity> {
    await this.correspondentsRepository.findOneByOrFail({
      id: correspondentId,
    });
    await this.correspondentsRepository.update({ id: correspondentId }, correspondentItem);
    return this.correspondentsRepository.findOneByOrFail({
      id: correspondentId,
    });
  }

  async deleteCorrespondent(
    correspondentId: number,
  ): Promise<Promise<CorrespondentEntity> | Promise<HttpException>> {
    try {
      const result = await this.correspondentsRepository.findOneBy({
        id: correspondentId,
      });
      await this.correspondentsRepository.delete({ id: correspondentId });

      return result;
    } catch (e) {
      return new HttpException(e, 404);
    }
  }

  async getAllOrgName(): Promise<OrgEntity[]> {
    return await this.orgRepository.find({
      where: {
        del: false,
        temp: false,
      },
    });
  }

  async addConInCard(idDoc: number, idOrg: number): Promise<ResponseType> {
    try {
      const addCorr = this.correspondentsRepository.create({
        org: idOrg,
        doc_id: idDoc,
      });
      await this.correspondentsRepository.save(addCorr);

      return new ResponseType(200, "", "Доп. корреспондент добавлен");
    } catch (e) {
      return new ResponseType(400, e, e);
    }
  }

  async deleteCorrespondentInCard(idDoc: number, idOrg: number): Promise<ResponseType> {
    try {
      await this.correspondentsRepository.delete({
        org: idOrg,
        doc_id: idDoc,
      });

      return new ResponseType(200, "", "Доп. корреспондент удалён");
    } catch (e) {
      return new ResponseType(400, e, e);
    }
  }

  async getAllCorrOfSendEmail(doc_id: number, typeSend: number): Promise<CorrespondentEntity[]> {
    const arrCorr = await this.getCorrespondentsByDoc(doc_id);
    return arrCorr.filter((el) => el.delivery_id === typeSend);
  }
}
