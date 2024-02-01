import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocStatusEntity } from "../../entity/#organization/docstatus/docStatus.entity";
import { DocStatusUpdate } from "./dto/docStatusDTO";

@Injectable()
export class DocStatusService {
  private readonly docStatusRepository: Repository<DocStatusEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.docStatusRepository = dataSource.getRepository(DocStatusEntity);
  }

  async getAllDocStatus(): Promise<DocStatusEntity[]> {
    return this.docStatusRepository.find({
      where: { temp: false },
      order: { nm: "ASC" },
    });
  }

  createTypeDoc(): Promise<DocStatusEntity> {
    const newDocStatusEntity: DocStatusEntity = this.docStatusRepository.create();
    return DocStatusEntity.save(newDocStatusEntity);
  }

  async updateTypeDoc(
    docStatusId: number,
    docStatusUpdate: DocStatusUpdate,
  ): Promise<DocStatusEntity> {
    await this.docStatusRepository.findOneByOrFail({ id: docStatusId });
    await this.docStatusRepository.update(docStatusId, docStatusUpdate);
    return this.docStatusRepository.findOneByOrFail({ id: docStatusId });
  }

  async deleteTypeDoc(id: number): Promise<DocStatusEntity> {
    const result = await this.docStatusRepository.findOneBy({ id: id });
    await this.docStatusRepository.delete({ id: id });
    return result;
  }
}
