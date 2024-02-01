import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, ViewColumn, ViewEntity } from "typeorm";
@ViewEntity({
  name: "doc_view",
  schema: "sad",
  expression: `
    SELECT
      doc.id,
      doc.body,
      kdoc.id AS kdoc_id,
      kdoc.nm AS kdoc_nm,
      tdoc.id AS tdoc_id,
      tdoc.nm AS tdoc_nm,
      docstatus.nm AS docstatus_nm,
      doc.reg_num,
      doc.dtc,
      CONCAT_WS(' ', execstaff.ln, execstaff.nm, execstaff.mn) AS exec_staff_fio,
      CONCAT_WS(' ', authorstaff.ln, authorstaff.nm, authorstaff.mn) AS author_staff_fio
    FROM
      sad.doc AS doc
      LEFT JOIN sad.kdoc AS kdoc ON doc.cls_id = kdoc.id
      LEFT JOIN sad.tdoc AS tdoc ON doc.tdoc = tdoc.id
      LEFT JOIN sad.docstatus AS docstatus ON doc.docstatus = docstatus.id
      LEFT JOIN sad.emp AS exec ON doc.exec = exec.id
      LEFT JOIN sad.users AS execuser ON exec.user_id = execuser.id
      LEFT JOIN sad.staff AS execstaff ON execuser.user_id = execstaff.id
      LEFT JOIN sad.emp AS author ON doc.author = author.id
      LEFT JOIN sad.users AS authoruser ON author.user_id = authoruser.id
      LEFT JOIN sad.staff AS authorstaff ON authoruser.user_id = authorstaff.id
  `,
})
@ObjectType()
export class DocViewEntity extends BaseEntity {
  @ViewColumn()
  @Field(() => Int, { nullable: true })
  id: number;

  @ViewColumn()
  @Field({ nullable: true })
  body: string;

  @ViewColumn()
  @Field(() => Int, { nullable: true })
  kdoc_id: number;

  @ViewColumn()
  @Field({ nullable: true })
  kdoc_nm: string;

  @ViewColumn()
  @Field(() => Int, { nullable: true })
  tdoc_id: number;

  @ViewColumn()
  @Field({ nullable: true })
  tdoc_nm: string;

  @ViewColumn()
  @Field({ nullable: true })
  docstatus_nm: string;

  @ViewColumn()
  @Field({ nullable: true })
  reg_num: string;

  @ViewColumn()
  @Field({ nullable: true })
  dtc: Date;

  @ViewColumn()
  @Field({ nullable: true })
  exec_staff_fio: string;

  @ViewColumn()
  @Field({ nullable: true })
  author_staff_fio: string;
}
