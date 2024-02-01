import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ResponseType } from "../../common/type/errorHelper.type";
import { TypeWorkerinput, WorkerType } from "../../common/type/worker.type";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";

@Injectable()
export class WorkerService {
  private readonly StaffRepository: Repository<StaffEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.StaffRepository = dataSource.getRepository(StaffEntity);
  }

  async getAllWorker(): Promise<WorkerType> {
    const count = await this.StaffRepository.count();
    return await this.StaffRepository.query(
      'With a As (  Select Count(*) Over() As ct, id, row_number() over(  Order By id::int asc  ) As rownum  From sad.emp  Where del::boolean = $1::boolean Order By id::int asc  Limit $2 Offset $3 )  Select  ( Select ct From a Limit 1 )  As "ct",id As "id",unit As "unit",(Select nm From sad.unit Where id = sad.emp.unit) As "unitnm",post As "post",(Select nm From sad.post Where id = sad.emp.post) As "postnm",staff As "staff",(Select (ln || \' \' || nm || \' \' || mn) From sad.staff Where id = sad.emp.staff) As "staffnm",(Select eml From sad.staff Where id = sad.emp.staff) As "staffemail",(Select TO_CHAR(dob::DATE, \' dd.mm.yyyy\') From sad.staff Where id = sad.emp.staff) As "staffdob",(Select phone From sad.staff Where id = sad.emp.staff) As "staffphone",Case When db is not null Then to_char(db ,\'    dd.mm.yyyy\') Else \'\' End As "db",Case When de is not null Then to_char(de ,\'dd.mm.yyyy\') Else \'\' End As "de",Case When isaut = false Then 0 Else 1 End As "isAut",Case When isexec = false Then 0 Else 1 End As "isExec",Case When issign = false Then 0 Else 1 End As "isSign",Case When del = false Then 0 Else 1 End As "del",(Select array_to_string(array_agg(tdoc), \',\') From sad.tdocsToEmps Where emp = sad.emp.id) As "tdoc",(Select array_to_string(array_agg(nm), \',\') From sad.tdoc where id in (Select tdoc from sad.tdocsToEmps Where emp= sad.emp.id)) As "tdocnm" From sad.emp  Where id In( Select id from a)  Order By id::int asc\n',
      [false, count, 0],
    );
  }

  async createWorker(obj: TypeWorkerinput): Promise<StaffEntity> {
    const TypeWorker: StaffEntity = this.StaffRepository.create(obj);
    await StaffEntity.save(TypeWorker);
    return TypeWorker;
  }

  async deleteWorker(id: number): Promise<ResponseType> {
    const worker = await this.StaffRepository.findOneBy({ id: id });

    await this.StaffRepository.update(id, { del: true });

    return new ResponseType(200, "0", `Сотрудник ${worker.nm} ${worker.ln} был удалён`);
  }
}
