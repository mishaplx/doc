import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Типы документов в СМДО" })
@Entity({ name: "smdo_doc_types", schema: "sad" })
export class SmdoDocTypesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;
  /** Дата обновления */
  @Column({ nullable: true, type: "text", comment: "updatedOn" })
  @Field({ nullable: true, description: "Дата обновления" })
  updatedOn: string;

  /** Код */
  @Column({ nullable: true, type: "text", comment: "docCode" })
  @Field({ nullable: true, description: "Код" })
  docCode: string;

  /** Статус */
  @Column({ nullable: true, type: "text", comment: "status" })
  @Field({ nullable: true, description: "Статус" })
  status: string;

  /** ID объекта */
  @Column({ nullable: true, type: "text", comment: "objId" })
  @Field({ nullable: true, description: "ID объекта" })
  objId: string;

  /** Имя */
  @Column({ nullable: true, type: "text", comment: "name" })
  @Field({ nullable: true, description: "Имя" })
  name: string;

  /** ID Записи */
  @Column({ nullable: true, type: "text", comment: "rowId" })
  @Field({ nullable: true, description: "ID Записи" })
  rowId: string;

  /** ID в СМДО */
  @Column({ nullable: true, type: "text", comment: "smdoId" })
  @Field({ nullable: true, description: "ID в СМДО" })
  smdoId: string;

  /** Дата создания */
  @Column({ nullable: true, type: "text", comment: "createdOn" })
  @Field({ nullable: true, description: "Дата создания" })
  createdOn: string;
}
