import { Field, GraphQLISODateTime, InputType, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql/type";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActionsDoc } from "../../../BACK_SYNC_FRONT/actions/actions.doc";
import { CitizenEntity } from "../citizen/citizen.entity";
import { CorrespondentEntity } from "../correspondent/correspondent.entity";
import { DeliveryEntity } from "../delivery/delivery.entity";
import { DocPackageEntity } from "../docPackage/docPackage.entity";
import { DocStatusEntity } from "../docstatus/docStatus.entity";
import { EmpEntity } from "../emp/emp.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";
import { ForwardingEntity } from "../forwarding/forwarding.entity";
import { JobEntity } from "../job/job.entity";
import { NotifyEntity } from "../notify/notify.entity";
import { OrgEntity } from "../org/org.entity";
import { PrivEntity } from "../priv/priv.entity";
import { ProjectEntity } from "../project/project.entity";
import { RelEntity } from "../rel/rel.entity";
import { RlsAccessEmpEntity } from "../rls/rls.access.emp.entity";
import { RlsAccessGroupEntity } from "../rls/rls.access.group.entity";
import { SignEntity } from "../sign/sign.entity";
import { TemplateEntity } from "../template/template.entity";
import { CdocEntity } from "./cdoc.entity";
import { KdocEntity } from "./kdoc.entity";
import { TdocEntity } from "./tdoc.entity";
import { UnitEntity } from "../unit/unit.entity";

@ObjectType()
@Entity({ name: "doc", schema: "sad" })
export class DocEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, comment: "Автор" })
  @Field(() => Int, { nullable: true, description: "Id автора" })
  author: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "author", foreignKeyConstraintName: "author_FK" })
  @Field(() => EmpEntity, { nullable: true, description: "Автор" })
  Author: Promise<EmpEntity>;

  @Column({
    nullable: true,
    comment: "Корреспондент входящего документа",
    type: "text",
  })
  @Field({ nullable: true, description: "Корреспондент входящего документа" })
  author_name: string;

  @Column({ nullable: true, comment: "Номер фирменного бланка.", type: "text" })
  @Field({
    nullable: true,
    defaultValue: "",
    description: "Номер фирменного бланка.",
  })
  number_blank: string;

  @Column({ nullable: true, comment: "Содержание", type: "text" })
  @Field({ nullable: true, description: "Содержание" })
  body: string;

  @ManyToOne(() => CitizenEntity, (city) => city.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "citizen_id", foreignKeyConstraintName: "citizen_id_fk" })
  @Field(() => CitizenEntity, {
    nullable: true,
    description: "Гражданин: объект",
  })
  citizen: Promise<CitizenEntity>;

  @Column({ nullable: true, comment: "Гражданин: id" })
  @Field(() => Int, { nullable: true, description: "Гражданин: id" })
  citizen_id: number;

  @Column({
    nullable: false,
    default: 1,
    comment: "Тип документа: id",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 1,
    description: "Тип документа: id",
  })
  cls_id: number;

  @ManyToOne(() => KdocEntity, (kdoc) => kdoc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "cls_id", foreignKeyConstraintName: "cls_fk" })
  @Field(() => KdocEntity, {
    nullable: false,

    description: "Тип документа: объект",
  })
  Cls: Promise<KdocEntity>;

  @OneToMany(() => CorrespondentEntity, (correspondent) => correspondent.Doc, {
    nullable: true,
  })
  @JoinColumn({ name: "id", foreignKeyConstraintName: "corr_fk" })
  @Field(() => [CorrespondentEntity], { nullable: true })
  Correspondent: Promise<CorrespondentEntity[]>;

  @OneToMany(() => RelEntity, (rel) => rel.DocDirect, { nullable: true })
  @JoinColumn({ name: "id", foreignKeyConstraintName: "rel_doc_direct_id_fk" })
  @Field(() => [RelEntity], { nullable: true })
  RelDirect: Promise<RelEntity[]>;

  @OneToMany(() => RelEntity, (rel) => rel.DocReverse, { nullable: true })
  @JoinColumn({ name: "id", foreignKeyConstraintName: "rel_doc_reverse_id_fk" })
  @Field(() => [RelEntity], { nullable: true })
  RelReverse: Promise<RelEntity[]>;

  @Column({ nullable: true, type: "date" })
  @Field(() => GraphQLString, { nullable: true })
  date_send_to_doc_package: Date;

  @Column({ nullable: true, comment: "Фактическая дата", type: "date" })
  @Field(() => String, { nullable: true, description: "Фактическая дата" })
  da: Date;

  @Column({ nullable: true, comment: "Исходящая дата" })
  @Field({ nullable: true, description: "Исходящая дата" })
  date_out_send: Date;

  @Column({ nullable: false, default: false })
  @Field({ nullable: false, defaultValue: false })
  del: boolean;

  @Column({ nullable: true, comment: "Доставка" })
  @Field(() => Int, { nullable: true, description: "Id доставки" })
  delivery: number;

  /********************************************
   * Подразделение инициатора документа (не путать с кодом подразделения)
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Подразделение инициатора документа (не путать с кодом подразделения): id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Подразделение инициатора документа (не путать с кодом подразделения): id",
  })
  unit_id: number;

  @ManyToOne(() => UnitEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "unit_id",
    foreignKeyConstraintName: "doc_unit_fk",
  })
  @Field(() => UnitEntity, {
    nullable: true,
    description: "Подразделение инициатора документа (не путать с кодом подразделения): объект",
  })
  Unit: Promise<UnitEntity>;

  // FIXME: УДАЛИТЬ ПОСЛЕ ПЕРЕНОСА ДАННЫХ В UNIT_ID
  @Column({ nullable: true, comment: "Код подразделения инициатора документа" })
  // @Field(() => String, { nullable: true, description: "Код подразделения инициатора документа" })
  code_exec_unit: string;

  @ManyToOne(() => DeliveryEntity, (dlvr) => dlvr.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "delivery", foreignKeyConstraintName: "delivery_FK" })
  @Field(() => DeliveryEntity, {
    nullable: true,
    description: 'Сущность "Тип доставки"',
  })
  Delivery: Promise<DeliveryEntity>;

  @Column({ nullable: true, comment: "Состояние", default: 1 })
  @Field(() => Int, { nullable: true, description: "Id состояния" })
  docstatus: number;

  @ManyToOne(() => DocStatusEntity, (docstatus) => docstatus.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "docstatus", foreignKeyConstraintName: "docstatus_FK" })
  @Field(() => DocStatusEntity, { nullable: true, description: "Состояние" })
  Docstatus: Promise<DocStatusEntity>;

  @Column({ nullable: true, comment: "Плановая дата", type: "date" })
  @Field(() => String, { nullable: true, description: "Плановая дата" })
  dp: Date;

  @Column({ nullable: true, comment: "Рег. дата", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Рег. дата" })
  dr: Date;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, comment: "Факт. дата завершения", type: "date" })
  @Field({ nullable: true, description: "Факт. дата завершения" })
  dter: Date;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  exec: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "exec", foreignKeyConstraintName: "exec_Fk" })
  @Field(() => EmpEntity, { nullable: true })
  Exec: Promise<EmpEntity>;

  @Column({ nullable: true, default: true })
  @Field({ nullable: true })
  isexec: boolean;

  @Column({ comment: "Физ/юр.лица", default: true })
  @Field({ description: "Физ/юр.лица" })
  isorg: boolean;

  @Column({
    nullable: true,
    comment: "Флаг: подписан ли документ",
    default: false,
  })
  @Field({ nullable: true, description: "Флаг: подписан ли документ" })
  issigned: boolean;

  @Field(() => [JobEntity], {
    nullable: true,
    description: "ссылка на поручение ",
  })
  @OneToMany(() => JobEntity, (jobs) => jobs.Doc)
  jobslink: Promise<JobEntity[]>;

  @Column({ nullable: true, comment: "Наименование", type: "text" })
  @Field({ nullable: true, description: "Наименование" })
  nm: string;

  @Column({ nullable: true, type: "text", comment: "Примечание" })
  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Column({ nullable: true, comment: "Рег.№", type: "text" })
  @Field({ nullable: true, description: "Рег.№" })
  reg_num: string;

  @ManyToOne(() => OrgEntity, (org) => org.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "org_id", foreignKeyConstraintName: "org_id_fk" })
  @Field(() => OrgEntity, {
    nullable: true,
    description: 'Сущность "Организация"',
  })
  org: Promise<OrgEntity>;

  @Column({ nullable: true, comment: "Организация" })
  @Field(() => Int, { nullable: true, description: "Id организации" })
  org_id: number;

  @Column({ nullable: true, comment: "Исходящая дата", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Исходящая дата" })
  outd: Date;

  @Column({ nullable: true, comment: "Исх.№(номер)", type: "text" })
  @Field({ nullable: true, description: "Исх.№(номер)" })
  outnum: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  owner: number;

  @ManyToOne(() => OrgEntity, (org) => org.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "owner", foreignKeyConstraintName: "owner_FK" })
  @Field(() => OrgEntity, { nullable: true })
  Owner: Promise<OrgEntity>;

  @Column({ nullable: true, comment: "Количество листов", type: "text", default: 1 })
  @Field({ nullable: true, description: "Количество листов" })
  pg: string;

  @Column({
    nullable: true,
    comment: "Документы с истекающим сроком исполнения",
    default: false,
  })
  @Field({
    nullable: true,
    description: "Документы с истекающим сроком исполнения",
  })
  prelost: boolean;

  @Column({ comment: "Доступ", default: 3 })
  @Field(() => Int, { description: "Id доступа" })
  priv: number;

  @ManyToOne(() => PrivEntity, (nmncl) => nmncl.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "priv", foreignKeyConstraintName: "priv_FK" })
  @Field(() => PrivEntity, { nullable: true, description: 'Сущность "Доступ"' })
  Priv: Promise<PrivEntity>;

  @Column({ nullable: true, comment: "Регион" })
  @Field(() => Int, { nullable: true, description: "Id региона" })
  region: number;

  @Column({ nullable: true, comment: "Вид документа" })
  @Field(() => Int, { nullable: true, description: "Id вид документа" })
  tdoc: number;

  @ManyToOne(() => TdocEntity, (tdoc) => tdoc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "tdoc", foreignKeyConstraintName: "tdoc_FK" })
  @Field(() => TdocEntity, {
    nullable: true,
    description: 'Сущность "Вид документа"',
  })
  Tdoc: Promise<TdocEntity>;

  @Column({ nullable: true, comment: "Класс документа" })
  @Field(() => Int, { nullable: true, description: "Id класса документа" })
  cdoc: number;

  @ManyToOne(() => CdocEntity, (cdoc) => cdoc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "cdoc", foreignKeyConstraintName: "cdoc_FK" })
  @Field(() => CdocEntity, {
    nullable: true,
    description: 'Сущность "Класс документа"',
  })
  Cdoc: Promise<CdocEntity>;

  @Column({ nullable: false, default: false })
  @Field({ nullable: false, defaultValue: false })
  temp: boolean;

  @Column({ nullable: true, comment: "Шаблон" })
  @Field(() => Int, { nullable: true, description: "Id шаблона" })
  template: number;

  @ManyToOne(() => TemplateEntity, (template) => template.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "template", foreignKeyConstraintName: "template_FK" })
  @Field(() => TemplateEntity, { nullable: true, description: "Шаблон" })
  Template: Promise<TemplateEntity>;

  @Column({
    nullable: true,
    type: "text",
    comment: "краткие сведения об исполнении",
  })
  @Field({ nullable: true, description: "краткие сведения об исполнении" })
  short_note: string;

  @OneToMany(() => ForwardingEntity, (forw) => forw.Doc)
  @Field(() => [ForwardingEntity], {
    nullable: true,
    description: "Передача/пересылка",
  })
  Forwarding: Promise<ForwardingEntity[]>;

  @Column({ nullable: true, comment: "Дело" })
  @Field(() => Int, { nullable: true, description: "Дело" })
  doc_package_id: number;

  @ManyToOne(() => DocPackageEntity, (docPackage) => docPackage.id)
  @JoinColumn({ name: "doc_package_id" })
  @Field(() => DocPackageEntity, {
    nullable: true,
    description: 'Сущность "Дело"',
  })
  DocPackage: Promise<DocPackageEntity>;

  @Column({ nullable: true, comment: "Временное дело" })
  @Field(() => Int, { nullable: true, description: "Временное дело" })
  doc_package_temp_id: number;

  @ManyToOne(() => DocPackageEntity, (docPackage) => docPackage.id)
  @JoinColumn({ name: "doc_package_temp_id" })
  @Field(() => DocPackageEntity, {
    nullable: true,
    description: 'Сущность "Временное Дело"',
  })
  DocPackageTemp: Promise<DocPackageEntity>;

  @Column({ nullable: true, comment: "Номер документа в деле" })
  @Field(() => Int, { nullable: true, description: "Номер документа в деле" })
  serial_number: number;

  @OneToMany(() => FileBlockEntity, (file_block) => file_block.Doc, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileBlockEntity], {
    nullable: true,
    description: "Прикрепленные файловые блоки",
  })
  FileBlock: Promise<FileBlockEntity[]>;

  /**
   * RLS доступ по emp_id
   */
  @OneToMany(() => RlsAccessEmpEntity, (item) => item.Doc, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessEmpEntity], {
    nullable: true,
    description: "RLS доступ по emp_id",
  })
  RlsAccessEmp: Promise<RlsAccessEmpEntity[]>;

  /**
   * RLS доступ по group_id
   */
  @OneToMany(() => RlsAccessGroupEntity, (item) => item.Doc, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessGroupEntity], {
    nullable: true,
    description: "RLS доступ по group_id",
  })
  RlsAccessGroup: Promise<RlsAccessGroupEntity[]>;

  /**
   * Сведения об исполнении поручений по документу
   */
  @Column({
    nullable: true,
    type: "text",
    comment: "Сведения об исполнении поручений по документу",
  })
  @Field(() => String, {
    nullable: true,
    description: "Сведения об исполнении поручений по документу",
  })
  jobs_info: string;

  /********************************************
   * Проект: id
   ********************************************/
  @Column({
    comment: "Проект: id",
    type: "number",
    nullable: true,
  })
  @Field({
    description: "Проект: id",
    nullable: true,
  })
  project_id: number;

  /********************************************
   * Проект: объект
   ********************************************/
  @OneToOne(() => ProjectEntity)
  @JoinColumn({
    name: "project_id",
    foreignKeyConstraintName: "doc_project_fk",
  })
  @Field(() => ProjectEntity, {
    description: "Проект: объект",
    nullable: true,
  })
  Project: Promise<ProjectEntity>;

  /********************************************
   * ЭЦП документа
   ********************************************/
  @OneToMany(() => SignEntity, (item) => item.Doc, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [SignEntity], {
    nullable: true,
    description: "ЭЦП документа",
  })
  Sign: Promise<SignEntity[]>;

  /********************************************
   * Сообщения по документу
   ********************************************/
  @OneToMany(() => NotifyEntity, (item) => item.Doc, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [NotifyEntity], {
    nullable: true,
    description: "Сообщения по документу",
  })
  Notify: Promise<NotifyEntity[]>;

  /********************************************
   * Подписал (не ЭЦП)
   ********************************************/
  @Column({
    nullable: true,
    comment: "Подписал (не ЭЦП)",
    type: "text",
  })
  @Field({
    nullable: true,
    description: "Подписал (не ЭЦП)",
  })
  signed: string;

  @Column({
    comment: "массив Языков",
    type: "json",
    nullable: true,
  })
  @Field(() => [languagesI], { nullable: true })
  languages: [languagesI];

  /********************************************
   * Доступные операции (заполнение в FindByIdDoc)
   ********************************************/
  @Field(() => [String], {
    defaultValue: [],
    description:
      "!!! ТОЛЬКО ДЛЯ FindByIdDoc !!!\n\nДоступные операции (список): " +
      Object.values(ActionsDoc).join(", "),
  })
  EnablingActions: string[];

  @Column({
    comment: "Заголовок",
    type: "varchar",
    nullable: true,
  })
  @Field(() => String, {
    nullable: true,
    description: "Заголовок",
  })
  header: string;

  @Field(() => Boolean, {
    nullable: true,
    description: "Заголовок",
  })
  isFavorites?: boolean;
}

@ObjectType("languages", { isAbstract: true })
@InputType()
export class languagesI {
  @Field(() => Int, { nullable: false })
  id: number;
  @Field(() => String, { nullable: false })
  label: string;
}
