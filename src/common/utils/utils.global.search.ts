import { JobsControlTypesEntity } from "src/entity/#organization/job/jobControlTypes.entity";
import { TypeJobEntity } from "src/entity/#organization/typeJob/typeJob.entity";
import { Brackets, Repository, SelectQueryBuilder } from "typeorm";

import { ActEntity } from "../../entity/#organization/act/act.entity";
import { AuditEntity } from "../../entity/#organization/audit/audit.entity";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { DocPackageEntity } from "../../entity/#organization/docPackage/docPackage.entity";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { EmpReplaceEntity } from "../../entity/#organization/emp_replace/emp_replace.entity";
import { IncmailEntity } from "../../entity/#organization/inmail/incmail.entity";
import { InventoryEntity } from "../../entity/#organization/inventory/inventory.entity";
import { JobEntity } from "../../entity/#organization/job/job.entity";
import { NumEntity } from "../../entity/#organization/num/num.entity";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { ProjectEntity } from "../../entity/#organization/project/project.entity";
import { SmdoPackagesEntity } from "../../entity/#organization/smdo/smdo_packages.entity";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { DocStatus } from "../../modules/doc/doc.const";
import { CdocEntity } from "../../entity/#organization/doc/cdoc.entity";
import { citizenSqlSelect } from "../../modules/doc/utils/doc.utils";

export async function searchAllColumnWithoutRelation<T>(
  repositoris: Repository<T>,
  searchField: string,
  offset: number,
  limit: number,
): Promise<[T[], number]> {
  const offsetLimit = createOffsetLimit(offset, limit);
  const schema = repositoris.metadata.schema;
  const tableName = repositoris.metadata.tableName;
  const str = `SELECT * FROM ${schema}.${tableName} WHERE `;
  const columnSearchName: string[] = [];

  repositoris.metadata.columns.forEach((column) => {
    if (column.propertyName !== "id" && column.type !== Boolean) {
      /*
    @TODO подумать как реализовать поиск по полям
    status :"A"
    subscriberStatus:"ACTIVE"
     */

      if (tableName === "smdo_abonents") {
        if (searchField.toLowerCase() === "активна" || searchField.toLowerCase() === "активно") {
          searchField = "A";
        }
      }

      columnSearchName.push(`"${column.propertyName}"`);
    }
  });

  const columnSearchNameMap = columnSearchName.map(
    (column) => column + `::text ILIKE '%${searchField}%'`,
  );
  const result = await repositoris.query(str + columnSearchNameMap.join(" OR ") + offsetLimit);
  return [result, result.length];
}

function createOffsetLimit(offset: number, limit: number): string {
  return `OFFSET ${(offset - 1) * limit} LIMIT ${limit};`;
}

export function globalSearchDocBuilderDoc(
  queryBuilder: SelectQueryBuilder<DocEntity>,
  searchField: string,
  args,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.addSelect(
    `
    CASE WHEN doc.isorg THEN (org.nm)
         ELSE ${citizenSqlSelect}
    END
  `,
    "citizen_order",
  );
  queryBuilder.leftJoinAndSelect("doc.Author", "Author");
  queryBuilder.leftJoinAndSelect("Author.User", "A_User");
  queryBuilder.leftJoinAndSelect("A_User.Staff", "A_staff");
  queryBuilder.leftJoinAndSelect("Author.post", "A_post");
  queryBuilder.leftJoinAndSelect("doc.Exec", "Exec", "Exec.del = false");
  queryBuilder.leftJoinAndSelect("Exec.User", "E_User");
  queryBuilder.leftJoinAndSelect("E_User.Staff", "E_Staff");
  queryBuilder.leftJoinAndSelect("doc.Cls", "Cls");
  queryBuilder.leftJoinAndSelect("doc.Delivery", "Delivery");
  queryBuilder.leftJoinAndSelect("doc.Docstatus", "Docstatus", "Docstatus.del = false");

  queryBuilder.leftJoinAndSelect("doc.Forwarding", "Forwarding", "Forwarding.del = false");
  queryBuilder.leftJoinAndSelect("doc.Priv", "Priv", "Priv.del = false");
  queryBuilder.leftJoinAndSelect("doc.Tdoc", "Tdoc");
  queryBuilder.leftJoinAndSelect("doc.citizen", "citizen", "citizen.del = false");
  queryBuilder.leftJoinAndSelect("doc.org", "org", "org.del = false");
  queryBuilder.leftJoinAndSelect("doc.DocPackage", "DocPackage", "DocPackage.del = false");
  queryBuilder.leftJoinAndSelect(
    "DocPackage.Nomenclature",
    "Nomenclature",
    "Nomenclature.del = false",
  );
  queryBuilder.leftJoinAndSelect("DocPackage.Status", "Status", "Status.del = false");

  queryBuilder.where("doc.del = false");
  queryBuilder.andWhere("doc.temp = false");
  if (args.docstatus === DocStatus.INWORK.id) {
    queryBuilder.andWhere(`\"Docstatus\".id = ${DocStatus.INWORK.id}`);
  }
  if (args.cls === 1) {
    queryBuilder.andWhere(`doc.cls_id = ${String(args.cls)}`);
  }
  if (args.cls === 2) {
    queryBuilder.andWhere(`doc.cls_id = ${String(args.cls)}`);
  }
  if (args.cls === 3) {
    queryBuilder.andWhere(`doc.cls_id = ${String(args.cls)}`);
  }

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where(`doc.reg_num::text ILIKE  ${params.searchField}`);
      if (args.docstatus === DocStatus.INWORK.id) {
        qb.orWhere(`\"Nomenclature\".index::text ILIKE  ${params.searchField}`);
      }
      qb.orWhere(`to_char("doc".dr::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
      qb.orWhere(`doc.signed::text ILIKE  ${params.searchField}`);
      qb.orWhere(`to_char("doc".outd::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Tdoc\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Cls\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Priv\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Delivery\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Docstatus\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`doc.nt::text ILIKE  ${params.searchField}`);
      qb.orWhere(`doc.isorg = true AND org.nm ILIKE ${params.searchField}`);
      qb.orWhere(`doc.isorg = false AND ${citizenSqlSelect} ILIKE ${params.searchField}`);
      qb.orWhere(`doc.outnum::text ILIKE  ${params.searchField}`);
      qb.orWhere(`doc.header::text ILIKE  ${params.searchField}`);

      if (args.cls === 0) {
        qb.orWhere(
          `(A_staff.ln || ' ' || substring(A_staff.nm for 1) || '.' || CONCAT(substring(A_staff.mn for 1)) || '. / ' || A_post.nm) ILIKE ${params.searchField}`,
        );
        qb.orWhere(
          `(E_Staff.ln || ' ' || substring(E_Staff.nm for 1) || '.' || CONCAT(substring(E_Staff.mn for 1)) || '. / ' || A_post.nm) ILIKE ${params.searchField}`,
        );
      }
      if (args.cls === 1) {
        qb.orWhere(
          `(A_staff.ln || ' ' || substring(A_staff.nm for 1) || '.' || CONCAT(substring(A_staff.mn for 1)) || '. / ' || A_post.nm) ILIKE ${params.searchField}`,
        );
      }
      if (args.cls === 2 || args.cls === 3) {
        qb.orWhere(
          `(E_Staff.ln || ' ' || substring(E_Staff.nm for 1) || '.' || CONCAT(substring(E_Staff.mn for 1)) || '. / ' || A_post.nm) ILIKE ${params.searchField}`,
        );
      }
    }),
  );
}

export function globalSearchProjectBuilderDoc(
  queryBuilder: SelectQueryBuilder<ProjectEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.leftJoinAndSelect("projects.Exec", "Exec");
  queryBuilder.leftJoinAndSelect("Exec.User", "E_user");
  queryBuilder.leftJoinAndSelect("E_user.Staff", "E_staff");
  queryBuilder.leftJoinAndSelect("Exec.post", "E_post");
  queryBuilder.leftJoinAndSelect("projects.Doc", "Doc");
  queryBuilder.leftJoinAndSelect("projects.Type_doc", "Type_doc");
  queryBuilder.leftJoinAndSelect("projects.View_doc", "View_doc");
  queryBuilder.leftJoinAndSelect("projects.Status", "Status");
  queryBuilder.leftJoinAndSelect("projects.CurrentStage", "CurrentStage");
  queryBuilder.leftJoin(
    "exec_in_project_route",
    "execInProjectRoute",
    "projects.id = execInProjectRoute.project_id",
  );

  queryBuilder.where("projects.del = false");
  queryBuilder.andWhere("projects.temp = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where(`projects.number::text ILIKE  ${params.searchField}`);
      qb.orWhere(`to_char("projects".dtc::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Type_doc\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"View_doc\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Status\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"CurrentStage\".name::text ILIKE ${params.searchField}`);
      qb.orWhere(
        `(E_staff.ln || ' ' || substring(E_staff.nm for 1) || '.' || CONCAT(substring(E_staff.mn for 1)) || '. / ' || E_post.nm) ILIKE ${params.searchField}`,
      );
      qb.orWhere(`projects.short_body::text ILIKE  ${params.searchField}`);
    }),
  );
}

export function globalSearchIncmailBuilderDoc(
  queryBuilder: SelectQueryBuilder<IncmailEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.where(`incmail.sender::text ILIKE ${params.searchField}`);
  queryBuilder.orWhere(`incmail.subject ILIKE ${params.searchField}`);
  queryBuilder.orWhere(
    `to_char("incmail".dt::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`,
  );
}

export function globalSearchJobBuilder(
  queryBuilder: SelectQueryBuilder<JobEntity>,
  searchField: string,
): void {
  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where("job.num ILIKE :searchField");
      qb.orWhere(`to_char("job".dtc::date, 'DD.MM.YYYY')::text ILIKE :searchField`);
      qb.orWhere("job.body ILIKE :searchField");
      qb.orWhere(
        ` CONCAT(E_staff.ln || ' ' || substring(E_staff.nm for 1) || '.' || CONCAT(substring(E_staff.mn for 1)) || '. / ' || E_post.nm) ILIKE :searchField`,
      );

      qb.orWhere(
        `CONCAT(A_staff.ln || ' ' || substring(A_staff.nm for 1) || '.' || CONCAT(substring(A_staff.mn for 1)) || '. / ' || A_post.nm) ILIKE :searchField`,
      );
      qb.orWhere(`\"Status\".nm ILIKE :searchField`);
      qb.orWhere(`\"TypeJob\".nm ILIKE :searchField`);
      qb.orWhere(`to_char("job".fact_date::date, 'DD.MM.YYYY')::text ILIKE :searchField`);
      qb.orWhere(`\"JobControlType\".nm ILIKE :searchField`);
      qb.orWhere("job.name_doc_in_job::text ILIKE :searchField");
    }),
  );
  queryBuilder.setParameter("searchField", `%${searchField}%`);
}

export function globalSearchEmpBuilder(
  queryBuilder: SelectQueryBuilder<EmpEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };
  queryBuilder.leftJoinAndSelect("emp.post", "Post");
  queryBuilder.leftJoinAndSelect("emp.unit", "Unit");
  queryBuilder.leftJoinAndSelect("emp.User", "User");
  queryBuilder.leftJoinAndSelect("User.Staff", "Staff");
  queryBuilder.leftJoinAndSelect("emp.roles", "Roles");
  queryBuilder.where(
    "emp.del=false and emp.temp = false and ( emp.de is null OR emp.de >= current_date)",
  );

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.orWhere(`\"Post\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Roles\".name::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Staff\".personnal_number::text ILIKE ${params.searchField}`);
      qb.orWhere(
        `(Staff.ln || ' ' || substring(Staff.nm for 1) || '.' || CONCAT(substring(Staff.mn for 1)) || '. / ' || Post.nm) ILIKE ${params.searchField}`,
      );
      qb.orWhere(
        `"Staff"."ln" || ' ' || "Staff"."nm" || ' ' || CONCAT("Staff"."mn") ILIKE ${params.searchField}`,
      );
      qb.orWhere(`\"Unit\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`"Staff".ln::text ILIKE ${params.searchField}`);
      qb.orWhere(`"Staff".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`"Staff".mn::text ILIKE ${params.searchField}`);

      qb.orWhere(`to_char("emp".db::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
      qb.orWhere(`to_char("emp".de::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
    }),
  );
}

export function globalSearchDocBuilderTypeJob(
  queryBuilder: SelectQueryBuilder<TypeJobEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.leftJoinAndSelect("type_job.DefaultEmp", "DefaultEmp");
  queryBuilder.leftJoinAndSelect("DefaultEmp.User", "User");
  queryBuilder.leftJoinAndSelect("User.Staff", "Staff");
  queryBuilder.leftJoinAndSelect("DefaultEmp.post", "post");
  queryBuilder.where("type_job.del = false");
  queryBuilder.andWhere("type_job.temp = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where(`type_job.nm ILIKE ${params.searchField}`);
      qb.orWhere(
        `(Staff.ln || ' ' || Staff.nm || ' ' || CONCAT(Staff.mn) || ' / ' || post.nm) ILIKE ${params.searchField}`,
      );
    }),
  );
}

export function globalSearchDocBuilderJobsControlTypes(
  queryBuilder: SelectQueryBuilder<JobsControlTypesEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.leftJoinAndSelect("jobs_control_types.Controller", "Controller");
  queryBuilder.leftJoinAndSelect("Controller.User", "User");
  queryBuilder.leftJoinAndSelect("User.Staff", "Staff");
  queryBuilder.leftJoinAndSelect("Controller.post", "post");
  queryBuilder.where("jobs_control_types.del = false");
  queryBuilder.andWhere("jobs_control_types.temp = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where(`jobs_control_types.nm ILIKE ${params.searchField}`);
      qb.orWhere(
        `(Staff.ln || ' ' || Staff.nm || ' ' || CONCAT(Staff.mn) || ' / ' || post.nm) ILIKE ${params.searchField}`,
      );
    }),
  );
}

export function globalSearchBuilderNum(
  queryBuilder: SelectQueryBuilder<NumEntity>,
  searchField: string,
): void {
  queryBuilder.leftJoinAndSelect("num.NumParamSel", "NumParamSel");
  queryBuilder.leftJoinAndSelect("NumParamSel.NumParam", "NumParam");
  queryBuilder.addCommonTableExpression(
    `
    SELECT "num"."id" AS                                            "s_num_id",
            array_to_string(array_agg("NumParam"."example" ORDER BY "NumParamSel"."id" ASC), '', '') "NumParam_example_str"
    FROM "sad"."num" "num"
      INNER JOIN "sad"."num_param_sel" "NumParamSel" ON "NumParamSel"."num_id" = "num"."id"
      INNER JOIN "sad"."num_param" "NumParam" ON "NumParam"."id" = "NumParamSel"."num_param_id"
    GROUP BY "num"."id"`,
    "s1",
  );
  queryBuilder.leftJoin("s1", "s", 'num.id = "s"."s_num_id"');
  queryBuilder.addSelect('"s"."NumParam_example_str"', "numparam_example_str");
  queryBuilder.addCommonTableExpression(
    `
    SELECT "num"."id"                                      AS "num_id",
           array_to_string(array_agg("Tdocs".nm), ',', '') AS "tdocs"
    FROM "sad"."num" "num"
          INNER JOIN "sad"."num_tdoc" "num_Tdocs" ON "num_Tdocs"."num_id" = "num"."id"
          INNER JOIN "sad"."tdoc" "Tdocs" ON "Tdocs"."id" = "num_Tdocs"."tdoc_id"
    GROUP BY "num"."id"`,
    "s2",
  );
  queryBuilder.leftJoin("s2", "s_2", 'num.id = "s_2"."num_id"');
  queryBuilder.addCommonTableExpression(
    `
    SELECT "num"."id"                                     AS "num_id",
           array_to_string(array_agg("Unit".nm), ',', '') AS "units"
    FROM "sad"."num" "num"
            INNER JOIN "sad"."num_unit" "num_Unit" ON "num_Unit"."num_id" = "num"."id"
            INNER JOIN "sad"."unit" "Unit" ON "Unit"."id" = "num_Unit"."unit_id"
    GROUP BY "num"."id"`,
    "s3",
  );
  queryBuilder.leftJoin("s3", "s_3", 'num.id = "s_3"."num_id"');
  queryBuilder.leftJoinAndSelect("num.Kdoc", "Kdoc");
  queryBuilder.leftJoinAndSelect("num.Tdocs", "Tdocs");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where(`\"Kdoc\".nm::text ILIKE :searchField`);
      qb.orWhere(`"s"."NumParam_example_str" ILIKE :searchField`);
      qb.orWhere(`"s_2"."tdocs" ILIKE :searchField`);
      qb.orWhere(`"s_3"."units" ILIKE :searchField`);
      qb.orWhere(`to_char("num".date_start::date, 'DD.MM.YYYY')::text ILIKE :searchField`);
      qb.orWhere(`to_char("num".date_end::date, 'DD.MM.YYYY')::text ILIKE :searchField`);
    }),
  );
  queryBuilder.setParameter("searchField", `%${searchField}%`);
}

export function globalSearchBuilderSignList(
  queryBuilder: SelectQueryBuilder<UserEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };
  queryBuilder.leftJoinAndSelect("user.Staff", "Staff");
  queryBuilder.where("user.del = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.orWhere(
        `(Staff.ln || ' ' || Staff.nm  || ' ' || CONCAT(Staff.mn)) ILIKE ${params.searchField}`,
      );
      qb.orWhere(`\"Staff\".ln::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Staff\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Staff\".mn::text ILIKE ${params.searchField}`);
      qb.orWhere(`to_char("user".dtc::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
      qb.orWhere(`"user".username ILIKE ${params.searchField}`);
      qb.orWhere(`\"Staff\".personnal_number::text ILIKE ${params.searchField}`);
    }),
  );
}

export function globalSearchBuilderEmpReplace(
  queryBuilder: SelectQueryBuilder<EmpReplaceEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder
    .leftJoinAndSelect("emp_replace.Emp_whom", "Emp_whom")
    .leftJoinAndSelect("Emp_whom.User", "Em_User")
    .leftJoinAndSelect("Em_User.Staff", "Em_Staff")
    .leftJoinAndSelect("Emp_whom.post", "Em_post")
    .leftJoinAndSelect("emp_replace.Emp_who", "Emp_who")
    .leftJoinAndSelect("Emp_who.User", "E_User")
    .leftJoinAndSelect("E_User.Staff", "E_Staff")

    .where("emp_replace.del = false")
    .andWhere(`emp_replace.temp = false`)
    .andWhere(`emp_replace.date_end >= current_date`)

    .andWhere(
      new Brackets((qb) => {
        qb.orWhere(
          `(Em_Staff.ln || ' ' || Em_Staff.nm || ' ' || CONCAT(Em_Staff.mn))::text ILIKE ${params.searchField}`,
        )

          .orWhere(
            `(E_Staff.ln || ' ' || E_Staff.nm || ' ' || CONCAT(E_Staff.mn))::text ILIKE ${params.searchField}`,
          )
          // POST
          .orWhere(`\"Em_post\".nm::text ILIKE ${params.searchField}`)
          .orWhere(
            `to_char("emp_replace".date_start::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`,
          )
          .orWhere(
            `to_char("emp_replace".date_end::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`,
          );
      }),
    );
}

export function globalSearchBuilderInventory(
  queryBuilder: SelectQueryBuilder<InventoryEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.innerJoinAndSelect("inventory.Status", "Status", "Status.del = false");
  queryBuilder.innerJoinAndSelect("inventory.Name", "Name", "Name.del = false");

  queryBuilder.where("inventory.del = false");
  queryBuilder.andWhere("inventory.temp = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.orWhere(`inventory.number::text ILIKE ${params.searchField}`);
      qb.orWhere(`inventory.description::text ILIKE ${params.searchField}`);
      qb.orWhere(`inventory.year::text ILIKE ${params.searchField}`);
      qb.orWhere(`inventory.count_doc_package::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Status\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Name\".nm::text ILIKE ${params.searchField}`);
    }),
  );
}

export function globalSearchBuilderdocPackage(
  queryBuilder: SelectQueryBuilder<DocPackageEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };
  queryBuilder.innerJoinAndSelect(
    "doc_package.Nomenclature",
    "Nomenclature",
    "Nomenclature.del = false",
  );
  queryBuilder.innerJoinAndSelect(
    "Nomenclature.MainParent",
    "MainParent",
    `MainParent.del = false`,
  );
  queryBuilder.innerJoinAndSelect(
    "Nomenclature.Article",
    "Article",
    "Article.del = false AND Article.temp = false",
  );
  queryBuilder.innerJoinAndSelect("Article.term", "term", "term.del = false AND term.temp = false");
  queryBuilder.innerJoinAndSelect("doc_package.Status", "Status", "Status.del = false");
  queryBuilder.leftJoinAndSelect(
    "doc_package.Inventory",
    "Inventory",
    "Inventory.del = false AND Inventory.temp = false",
  );
  queryBuilder.leftJoinAndSelect("Inventory.Name", "InventoryName", "InventoryName.del = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.orWhere(`term.nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Inventory\".year::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Nomenclature\".index::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Nomenclature\".name::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Nomenclature\".nt::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Inventory\".year::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Nomenclature\".storage_comment::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"Status\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`\"MainParent\".name::text ILIKE ${params.searchField}`);
      qb.orWhere(
        `('№ ' || Inventory.number || ' за ' || Inventory.year || ' ' || InventoryName.nm) ILIKE ${params.searchField}`,
      );
      qb.orWhere(
        `to_char("doc_package".start_date::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`,
      );
      qb.orWhere(
        `to_char("doc_package".end_date::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`,
      );
      qb.orWhere(`doc_package.count_doc::text ILIKE ${params.searchField}`);
      qb.orWhere(`doc_package.count_file::text ILIKE ${params.searchField}`);
    }),
  );
}

export function globalSearchBuilderAct(
  queryBuilder: SelectQueryBuilder<ActEntity>,
  searchField: string,
): void {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.innerJoinAndSelect("act.Status", "Status", "Status.del = false");

  queryBuilder.where("act.del = false");
  queryBuilder.andWhere("act.temp = false");

  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.orWhere(`act.number::text ILIKE ${params.searchField}`);
      qb.orWhere(`act.basis::text ILIKE ${params.searchField}`);
      qb.orWhere(`act.count_doc_package::text ILIKE ${params.searchField}`);
      qb.orWhere(`act.count_doc::text ILIKE ${params.searchField}`);
      qb.orWhere(`act.count_file::text ILIKE ${params.searchField}`);

      qb.orWhere(`\"Status\".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`to_char("act".dtc::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
    }),
  );
}

export async function globalSearchBuilderAudit(
  queryBuilder: SelectQueryBuilder<AuditEntity>,
  searchField: string,
): Promise<void> {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.leftJoinAndSelect("audit.User", "User");
  queryBuilder.leftJoinAndSelect("audit.Staff", "Staff");

  queryBuilder.where(
    new Brackets((qb) => {
      qb.orWhere(`audit.id::text ILIKE ${params.searchField}`);
      qb.orWhere(`audit.event::text ILIKE ${params.searchField}`);
      qb.orWhere(`audit.description::text ILIKE ${params.searchField}`);
      qb.orWhere(
        `"Staff"."ln" || ' ' || "Staff"."nm" || ' ' || CONCAT("Staff"."mn") ILIKE ${params.searchField}`,
      );
      qb.orWhere(`audit.type::text ILIKE ${params.searchField}`);
      qb.orWhere(`"Staff".ln::text ILIKE ${params.searchField}`);
      qb.orWhere(`"User".username::text ILIKE ${params.searchField}`);
      qb.orWhere(`"Staff".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`"Staff".mn::text ILIKE ${params.searchField}`);
      qb.orWhere(`to_char("audit".dtc::date, 'DD.MM.YYYY')::text ILIKE ${params.searchField}`);
    }),
  );
}

export async function globalSearchBuilderSmdoPackages(
  queryBuilder: SelectQueryBuilder<SmdoPackagesEntity>,
  searchField: string,
): Promise<void> {
  const params = { searchField: `'%${searchField}%'` };

  queryBuilder.leftJoinAndSelect("smdo_packages.FromAbonent", "FromAbonent");
  queryBuilder.leftJoinAndSelect("smdo_packages.Receivers", "Receivers");
  queryBuilder.where(
    new Brackets((qb) => {
      qb.orWhere(`"smdo_packages".status::text ILIKE ${params.searchField}`);
      qb.orWhere(`"smdo_packages".result::text ILIKE ${params.searchField}`);
      qb.orWhere(`"smdo_packages".type::text ILIKE ${params.searchField}`);
      qb.orWhere(`"smdo_packages"."ackType"::text ILIKE ${params.searchField}`);
      qb.orWhere(`"smdo_packages"."docId"::text ILIKE ${params.searchField}`);
      qb.orWhere(`"smdo_packages"."smdoId"::text ILIKE ${params.searchField}`);
      qb.orWhere(`"smdo_packages"."outNumber"::text ILIKE ${params.searchField}`);
      qb.orWhere(`"FromAbonent"."abbreviatedName"::text ILIKE ${params.searchField}`);
    }),
  );
}

export function globalSearchCdocBuilder(
  queryBuilder: SelectQueryBuilder<CdocEntity>,
  searchField: string,
): void {
  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where("cdoc.code ILIKE :searchField");
      qb.orWhere("cdoc.nm ILIKE :searchField");
    }),
  );
  queryBuilder.setParameter("searchField", `%${searchField}%`);
}

export function globalSearchTdocBuilder(
  queryBuilder: SelectQueryBuilder<CdocEntity>,
  searchField: string,
): void {
  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.where("tdoc.nm ILIKE :searchField");
      qb.orWhere("tdoc.code ILIKE :searchField");
      qb.orWhere("SmdoDocTypes.name ILIKE :searchField");
    }),
  );
  queryBuilder.setParameter("searchField", `%${searchField}%`);
}

export async function globalSearchBuilderOrganization(
  queryBuilder: SelectQueryBuilder<OrgEntity>,
  searchField: string,
): Promise<void> {
  const params = { searchField: `'%${searchField}%'` };
  queryBuilder.leftJoinAndSelect("org.Region", "Region");
  queryBuilder.leftJoinAndSelect("org.SmdoAbonent", "SmdoAbonent");
  queryBuilder.where("org.del = false");
  queryBuilder.andWhere("org.temp = false");
  queryBuilder.andWhere(
    new Brackets((qb) => {
      qb.orWhere(`"org".nm::text ILIKE ${params.searchField}`);
      qb.orWhere(`"org".fnm::text ILIKE ${params.searchField}`);
      qb.orWhere(`"org".email::text ILIKE ${params.searchField}`);
      qb.orWhere(`"org"."fax"::text ILIKE ${params.searchField}`);
      qb.orWhere(`"org"."phone"::text ILIKE ${params.searchField}`);
    }),
  );
}
