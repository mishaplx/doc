import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { RegionEntity } from "../region/region.entity";
import { SmdoAbonentsEntity } from "../smdo/smdo_abonents.entity";
import { TypeOrgEntity } from "../typeorg/typeorg.entity";

@ObjectType({ isAbstract: true })
@Entity({ name: "org", schema: "sad" })
@Index(["unp", "fnm"], { unique: true, where: "del = false" })
// @Index(['smdocode'], {
//   where: '(del = false) AND (temp = false)',
// })
@Check(`"sup" <> "id"`)
export class OrgEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "Наименование", type: "text" })
  @Field({ description: "Наименование" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  del: boolean;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  temp: boolean;

  @Column({ nullable: true, type: "text" })
  @Field({ nullable: true })
  fullstring: string;

  @Column({ nullable: true, type: "text" })
  @Field({ nullable: true })
  rowid: string;

  @Column({ comment: "Полное наименование", type: "text", nullable: true })
  @Field({ description: "Полное наименование", nullable: true })
  fnm: string;

  @Column({ nullable: true, comment: "Вышестоящая организация" })
  @Field(() => Int, { nullable: true, description: "Вышестоящая организация" })
  sup: number;

  @ManyToOne(() => OrgEntity, (org) => org.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "sup", foreignKeyConstraintName: "sup_fk" })
  @Field(() => OrgEntity, {
    nullable: true,
    description: "Сущность Вышестоящая организация",
  })
  ParentOrg: OrgEntity;

  @Column({ nullable: true, comment: "УНП", type: "text" })
  @Field({ nullable: true, description: "УНП" })
  unp: string;

  @Column({ nullable: true, comment: "Факс", type: "text" })
  @Field({ nullable: true, description: "Факс" })
  fax: string;

  @Column({ nullable: true, comment: "Телефон", type: "text" })
  @Field({ nullable: true, description: "Телефон" })
  phone: string;

  @Column({ nullable: true, comment: "Адресс", type: "text" })
  @Field({ nullable: true, description: "Адресс" })
  adress: string;

  @Column({ nullable: true, type: "text" })
  @Field({ nullable: true })
  pki: string;

  @Column({ nullable: true, type: "date" })
  @Field({ nullable: true, description: "Дата начала деятельности" })
  db: string;

  @Column({ nullable: true, type: "date" })
  @Field({ nullable: true, description: "Дата прекращения деятельности" })
  de: string;

  @Column({ nullable: true, comment: 'Id справочника "Регионы"' })
  @Field(() => Int, { nullable: true, description: 'Id справочника "Регионы"' })
  region: number;

  @ManyToOne(() => RegionEntity, (region) => region.id, {
    nullable: true,
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @JoinColumn({ name: "region", foreignKeyConstraintName: "region_fk" })
  @Field(() => RegionEntity, { nullable: true, description: "Сущность регион" })
  Region: Promise<RegionEntity>;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  typeorg: number;

  @ManyToOne(() => TypeOrgEntity, (typeOrg) => typeOrg.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "typeorg", foreignKeyConstraintName: "typeorg" })
  @Field(() => TypeOrgEntity, {
    nullable: true,
    description: "Сущность тип организации",
  })
  TypeOrg: Promise<TypeOrgEntity>;

  @Column({ nullable: true, comment: "Эл. почта", type: "text" })
  @Field({ nullable: true, description: "Эл. почта" })
  email: string;

  @Column({ nullable: true, comment: "Примечание", type: "text" })
  @Field({ nullable: true, description: "Примечание" })
  note: string;

  @Column({ nullable: true, comment: "Название в СМД", type: "text" })
  @Field({ nullable: true, description: "Название в СМД" })
  smdocode: string;

  @Column({ nullable: true, comment: "ID в СМД", type: "text" })
  @Field({ nullable: true, description: "ID в СМД" })
  smdoId: string;

  @ManyToOne(() => SmdoAbonentsEntity, (smdoAbonents) => smdoAbonents.smdoId, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "smdoId",
    referencedColumnName: "smdoId",
  })
  @Field(() => SmdoAbonentsEntity, {
    nullable: true,
    description: "Сущность абонент СМДО",
  })
  SmdoAbonent: Promise<SmdoAbonentsEntity>;
}
