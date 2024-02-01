import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { SmdoAbonentsEntity } from "./smdo_abonents.entity";
import { SmdoPackagesReceiversEntity } from "./smdo_packages_receivers.entity";

@ObjectType({ description: "Пакеты СМДО" })
@Entity({ name: "smdo_packages", schema: "sad" })
export class SmdoPackagesEntity extends BaseEntity {
  // для создания дерева
  Children: SmdoPackagesEntity[];

  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /** ссылка на запись очереди отправки (без связи) */
  @Index()
  @Column({
    nullable: true,
    comment: "ссылка на запись очереди отправки (без связи)",
  })
  @Field(() => Int, {
    nullable: true,
    description: "ссылка на запись очереди отправки (без связи)"
  })
  smdo_stack_id: number;

  /** ID в СМДО */
  @Column({ nullable: true, type: "text", comment: "smdoId", unique: true })
  @Field({ nullable: true, description: "ID в СМДО" })
  smdoId: string;

  /** Абоненты получатели */
  @OneToMany(
    () => SmdoPackagesReceiversEntity,
    (smdoPackagesReceivers) => smdoPackagesReceivers.PackageSmdo,
    {
      onDelete: "CASCADE",
    },
  )
  // @JoinColumn({ name: 'smdoId', referencedColumnName: 'packageSmdoId' })
  @Field(() => [SmdoPackagesReceiversEntity], {
    nullable: true,
    description: "Абоненты получатели",
  })
  Receivers: Promise<SmdoPackagesReceiversEntity[]>;

  /** ID родительского пакета в СМДО */
  @Column({ nullable: true, type: "text", comment: "smdoParentId" })
  @Field({ nullable: true, description: "ID родительского пакета в СМДО" })
  smdoParentId: string;

  /** ID заголовка */
  @Column({ nullable: true, type: "text", comment: "headerId" })
  @Field({ nullable: true, description: "ID заголовка" })
  headerId: string;

  /** Признак того является ли пакет квитанцией */
  @Column({ nullable: true, type: "boolean", comment: "ack" })
  @Field({ nullable: true, description: "Признак того является ли пакет квитанцией" })
  ack: boolean;

  /** ID подтверждения */
  @Column({ nullable: true, type: "text", comment: "confirmId" })
  @Field({ nullable: true, description: "ID подтверждения" })
  confirmId: string;

  /** От абонента ID*/
  @Column({ nullable: true, type: "text", comment: "fromAbonentId" })
  @Field({ nullable: true, description: " От абонента ID в СМДО" })
  fromAbonentId: string;

  /** Организация отправитель */
  @ManyToOne(() => SmdoAbonentsEntity)
  @JoinColumn({ name: "fromAbonentId", referencedColumnName: "smdoId" })
  @Field(() => SmdoAbonentsEntity, {
    nullable: true,
    description: "Организация отправитель",
  })
  FromAbonent: Promise<SmdoAbonentsEntity>;

  /** Абоненту ID*/
  @Column({ nullable: true, type: "text", comment: "toAbonentId" })
  @Field({ nullable: true, description: "Абоненту ID в СМДО" })
  toAbonentId: string;

  /** Организация получатель */
  @ManyToOne(() => SmdoAbonentsEntity)
  @JoinColumn({ name: "toAbonentId", referencedColumnName: "smdoId" })
  @Field(() => SmdoAbonentsEntity, {
    nullable: true,
    description: "Организация получатель",
  })
  ToAbonent: Promise<SmdoAbonentsEntity>;

  /** Дата в */
  @Column({ nullable: true, comment: "dateIn" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата в",
  })
  dateIn: Date;

  /** Дата отправки */
  @Column({ nullable: true, comment: "dateSent" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата отправки",
  })
  dateSent: Date;

  /** Вложения */
  @Column({ nullable: true, type: "json", comment: "attachments" })
  @Field(() => JSON, { nullable: true, description: "Вложения" })
  attachments: any;

  /** Тело пакета */
  @Column({ nullable: true, type: "json", comment: "body" })
  @Field(() => JSON, { nullable: true, description: "Тело пакета" })
  body: any;

  /** Тип пакета */
  @Column({ nullable: true, type: "text", comment: "type" })
  @Field({ nullable: true, description: "Тип пакета" })
  type: string;

  /** Статус пакета */
  @Column({ nullable: true, type: "text", comment: "status" })
  @Field({ nullable: true, description: "Статус пакета" })
  status: string;

  /** Исходящий номер */
  @Column({ nullable: true, type: "text", comment: "outNumber" })
  @Field({ nullable: true, description: "Исходящий номер" })
  outNumber: string;

  /** Исходящая дата */
  @Column({ nullable: true, comment: "outDate" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Исходящая дата",
  })
  outDate: Date;

  /** Внутренний номер */
  @Column({ nullable: true, type: "text", comment: "outNumber" })
  @Field({ nullable: true, description: "Внутренний номер" })
  inNumber: string;

  /** Внутренняя дата */
  @Column({ nullable: true, comment: "inDate" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Внутренняя дата",
  })
  inDate: Date;

  /** Результат */
  @Column({ nullable: true, type: "text", comment: "result" })
  @Field({ nullable: true, description: "Результат" })
  result: string;

  /** Ошибка */
  @Column({ nullable: true, type: "text", comment: "error" })
  @Field({ nullable: true, description: "Ошибка" })
  error: string;

  /** Тип квитанции */
  @Column({ nullable: true, type: "text", comment: "ackType" })
  @Field({ nullable: true, description: "Тип квитанции" })
  ackType: string;

  /** ID Документа, сохраненного из пакета */
  @Column({ nullable: true, type: "integer", comment: "docId" })
  @Field({ nullable: true, description: "ID Документа, сохраненного из пакета" })
  docId: number;

  /** ID Документа, сохраненного из пакета */
  @Column({ nullable: true, type: "text", comment: "idnumber" })
  @Field({ nullable: true, description: "idnumber из пакета СМДО" })
  idnumber: string;
}
