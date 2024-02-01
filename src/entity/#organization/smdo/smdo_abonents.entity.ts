import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Абоненты в СМДО" })
@Entity({ name: "smdo_abonents", schema: "sad" })
export class SmdoAbonentsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /** Дата обновления */
  @Column({ nullable: true, type: "text", comment: "updatedOn" })
  @Field({ nullable: true, description: "Дата обновления" })
  updatedOn: string;

  /** Статус */
  @Column({ nullable: true, type: "text", comment: "status" })
  @Field({ nullable: true, description: "Статус" })
  status: string;

  /** Код */
  @Column({ nullable: true, type: "text", comment: "smdoCode" })
  @Field({ nullable: true, description: "Код" })
  smdoCode: string;

  /** Статус подписчика */
  @Column({ nullable: true, type: "text", comment: "subscriberStatus" })
  @Field({ nullable: true, description: "Статус подписчика" })
  subscriberStatus: string;

  /** ID объекта */
  @Column({ nullable: true, type: "text", comment: "objId" })
  @Field({ nullable: true, description: "ID объекта" })
  objId: string;

  /** Имя */
  @Column({ nullable: true, type: "text", comment: "brandName" })
  @Field({ nullable: true, description: "Имя" })
  brandName: string;

  /** Адрес */
  @Column({ nullable: true, type: "text", comment: "address" })
  @Field({ nullable: true, description: "Адрес" })
  address: string;

  /** Полное имя */
  @Column({ nullable: true, type: "text", comment: "fullName" })
  @Field({ nullable: true, description: "Полное имя" })
  fullName: string;

  /** Зарегистрировано */
  @Column({ nullable: true, type: "text", comment: "authorityRegistered" })
  @Field({ nullable: true, description: "Зарегистрировано" })
  authorityRegistered: string;

  /** abbreviatedName */
  @Column({ nullable: true, type: "text", comment: "abbreviatedName" })
  @Field({ nullable: true, description: "abbreviatedName" })
  abbreviatedName: string;

  /** egrStatus */
  @Column({ nullable: true, type: "text", comment: "egrStatus" })
  @Field({ nullable: true, description: "egrStatus" })
  egrStatus: string;

  /** orgType */
  @Column({ nullable: true, type: "text", comment: "orgType" })
  @Field({ nullable: true, description: "orgType" })
  orgType: string;

  /** ID Записи */
  @Column({ nullable: true, type: "text", comment: "rowId" })
  @Field({ nullable: true, description: "ID Записи" })
  rowId: string;

  /** ID в СМДО */
  @Column({ type: "text", comment: "smdoId", unique: true })
  @Field({ description: "ID в СМДО" })
  smdoId: string;

  /** Дата создания */
  @Column({ nullable: true, type: "text", comment: "createdOn" })
  @Field({ nullable: true, description: "Дата создания" })
  createdOn: string;

  @Field(() => Int, { nullable: true })
  idOrgSmdo: number;

  get getID() {
    return this.id;
  }

  set getID(props) {
    this.idOrgSmdo = props;
  }
}
