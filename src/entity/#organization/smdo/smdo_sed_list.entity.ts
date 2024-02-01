import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Список СЭД в СМДО" })
@Entity({ name: "smdo_sed_list", schema: "sad" })
export class SmdoSedListEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;
  /** Дата обновления */
  @Column({ nullable: true, type: "text", comment: "updatedOn" })
  @Field({ nullable: true, description: "Дата обновления" })
  updatedOn: string;

  /** Описание */
  @Column({ nullable: true, type: "text", comment: "description" })
  @Field({ nullable: true, description: "Описание" })
  description: string;

  /** Наличие сертификата */
  @Column({ nullable: true, type: "boolean", comment: "certified" })
  @Field({ nullable: true, description: "Наличие сертификата" })
  certified: boolean;

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
