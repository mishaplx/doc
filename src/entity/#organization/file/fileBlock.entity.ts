import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DocEntity } from "../doc/doc.entity";
import { ExecInprojectRouteEntity } from "../project/execInprojectRoute.entity";
import { IncmailEntity } from "../inmail/incmail.entity";
import { JobEntity } from "../job/job.entity";
import { ProjectEntity } from "../project/project.entity";
import { ProjectTemplateEntity } from "../project_template/project_template.entity";
import { ReportEntity } from "../report/report.entity";
import { FileVersionEntity } from "./fileVersion.entity";
import { UserSessionEntity } from "../user/userSession.entity";
import { InventoryEntity } from "../inventory/inventory.entity";
import { DocPackageEntity } from "../docPackage/docPackage.entity";
import { ActEntity } from "../act/act.entity";

@ObjectType({ description: "Файловый блок" })
@Entity({ name: "file_block", schema: "sad" })
export class FileBlockEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Версии файла
   ********************************************/
  @OneToMany(() => FileVersionEntity, (file_version) => file_version.FileBlock, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileVersionEntity], {
    nullable: true,
    description: "Версии файла",
  })
  FileVersions: Promise<FileVersionEntity[]>;


  /********************************************
   * Количество версий: number (заполнение @AfterLoad)
   ********************************************/
  @Field(() => Int, {
    description: "Файлы: количество версий",
  })
  file_version_count: number;
  // public get file_version_count(): number {
  //   return this.FileVersions?.length ?? 0;
  // }

  /********************************************
   * Проект: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Проект: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Проект: id",
  })
  project_id: number;

  /********************************************
   * Проект: объект
   ********************************************/
  @ManyToOne(() => ProjectEntity, (project) => project.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "project_id",
    foreignKeyConstraintName: "project_fileblock_fk",
  })
  @Field(() => ProjectEntity, {
    nullable: true,
    description: "Проект: объект",
  })
  Project: Promise<ProjectEntity>;

  /********************************************
   * Шаблон проекта: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Шаблон проекта: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Шаблон проекта: id",
  })
  project_template_id: number;

  /********************************************
   * Шаблон проекта: объект
   ********************************************/
  @ManyToOne(() => ProjectTemplateEntity, (projectTemplate) => projectTemplate.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "project_template_id",
    foreignKeyConstraintName: "project_template_fileblock_fk",
  })
  @Field(() => ProjectTemplateEntity, {
    nullable: true,
    description: "Шаблон проекта: объект",
  })
  ProjectTemplate: Promise<ProjectTemplateEntity>;

  /********************************************
   * Исполнение проекта документа: id
   ********************************************/
  @Index()
  @Column({
    comment: "Исполнение проекта документа: id",
    type: "number",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Исполнение проекта документа: id",
    nullable: true,
  })
  project_exec_id: number;

  /********************************************
   * Исполнение проекта документа: объект
   ********************************************/
  @OneToOne(() => ExecInprojectRouteEntity)
  @JoinColumn({
    name: "project_exec_id",
    foreignKeyConstraintName: "file_block_project_exec_fk",
  })
  @Field(() => ExecInprojectRouteEntity, {
    description: "Исполнение проекта документа: объект",
    nullable: true,
  })
  ProjectExec: Promise<ExecInprojectRouteEntity>;

  /********************************************
   * Документ: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Документ: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Документ: id",
  })
  doc_id: number;

  /********************************************
   * Документ: объект
   ********************************************/
  @ManyToOne(() => DocEntity, (doc) => doc.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_id",
    foreignKeyConstraintName: "doc_fileblock_fk",
    // referencedColumnName: 'id',
  })
  @Field(() => DocEntity, {
    nullable: true,
    description: "Документ: объект",
  })
  Doc: Promise<DocEntity>;

  /********************************************
   * Поручение: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Поручение: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Поручение: id",
  })
  job_id: number;

  /********************************************
   * Поручение: объект
   ********************************************/
  @ManyToOne(() => JobEntity, (job) => job.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "job_fileblock_fk",
  })
  @Field(() => JobEntity, {
    nullable: true,
    description: "Поручение: объект",
  })
  Job: Promise<JobEntity>;

  /********************************************
   * Почтовый импорт: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Почтовый импорт: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Почтовый импорт: id",
  })
  incmail_id: number;

  /********************************************
   * Почтовый импорт: объект
   ********************************************/
  @ManyToOne(() => IncmailEntity, (project) => project.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "incmail_id",
    foreignKeyConstraintName: "incmail_fileblock_fk",
  })
  @Field(() => IncmailEntity, {
    nullable: true,
    description: "Почтовый импорт: объект",
  })
  Incmail: Promise<IncmailEntity>;

  /********************************************
   * Отчет: id
   ********************************************/
  @Index()
  @Column({
    comment: "Отчет: id",
    type: "number",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Отчет: id",
    nullable: true,
  })
  report_id: number;

  /********************************************
   * Отчет: объект
   ********************************************/
  @OneToOne(() => ReportEntity, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "report_id",
    foreignKeyConstraintName: "file_block_report_fk",
  })
  @Field(() => ReportEntity, {
    description: "Отчет: объект",
    nullable: true,
  })
  Report: Promise<ReportEntity>;

  /********************************************
   * Опись: id
   ********************************************/
  @Index()
  @Column({
    comment: "Опись: id",
    type: "number",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Опись: id",
    nullable: true,
  })
  inventory_id: number;

  /********************************************
   * Опись: объект
   ********************************************/
  @OneToOne(() => InventoryEntity, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "inventory_id",
    foreignKeyConstraintName: "file_block_inventory_fk",
  })
  @Field(() => InventoryEntity, {
    description: "Опись: объект",
    nullable: true,
  })
  Inventory: Promise<InventoryEntity>;

  /********************************************
   * Дело (внутренняя опись): id
   ********************************************/
  @Index()
  @Column({
    comment: "Дело (внутренняя опись): id",
    type: "number",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Дело (внутренняя опись): id",
    nullable: true,
  })
  doc_package_id: number;

  /********************************************
   * Дело (внутренняя опись): объект
   ********************************************/
  @OneToOne(() => DocPackageEntity, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_package_id",
    foreignKeyConstraintName: "file_block_dock_package_fk",
  })
  @Field(() => DocPackageEntity, {
    description: "Дело (внутренняя опись): объект",
    nullable: true,
  })
  DocPackage: Promise<DocPackageEntity>;


  /********************************************
   * Акт: id
   ********************************************/
  @Index()
  @Column({
    comment: "Акт: id",
    type: "number",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Акт: id",
    nullable: true,
  })
  act_id: number;

  /********************************************
   * Акт: объект
   ********************************************/
  @OneToOne(() => ActEntity, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "act_id",
    foreignKeyConstraintName: "file_block_act_fk",
  })
  @Field(() => ActEntity, {
    description: "Акт: объект",
    nullable: true,
  })
  Act: Promise<ActEntity>;


  /********************************************
   * Признак: карточка РКК
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Признак: карточка РКК",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Признак: карточка РКК",
  })
  rkk: boolean;

  /********************************************
   * Признак: обязательный файл проекта
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Признак: обязательный файл проекта",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Признак: обязательный файл проекта",
  })
  project_required: boolean;

  /********************************************
   * Блокировка изменения:
   * сессия, в интересах которой произведена блокировка
   * сейчас достаточно связи 1-1, но
   * на перспективу сделана связь oo-1
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Блокировка изменения: сессия, в интересах которой произведена блокировка",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Блокировка изменения: сессия, в интересах которой произведена блокировка",
  })
  block_user_session_id: number;

  @ManyToOne(() => UserSessionEntity, (item) => item.id, {
    nullable: true,
    onDelete: "SET NULL", // !!! только так !!!
    onUpdate: "CASCADE", // !!! только так !!!
  })
  @JoinColumn({
    name: "block_user_session_id",
    foreignKeyConstraintName: "file_block_user_session_fk",
  })
  @Field(() => UserSessionEntity, {
    nullable: true,
    description: "Блокировка изменения: сессия, в интересах которой произведена блокировка",
  })
  BlockUserSession: Promise<UserSessionEntity>;

  /********************************************
   * Количество использованных версий файла: счетчик
   ********************************************/
  @Column({
    nullable: false,
    default: 0,
    comment: "Количество использованных версий файла: счетчик",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 0,
    description: "Количество использованных версий файла: счетчик",
  })
  file_version_counter: number;

  /********************************************
   * Главная версия файла: id
   ********************************************/
  @Index()
  @Column({
    comment: "Главная версия файла: id",
    type: "number",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Главная версия файла: id",
    nullable: true,
  })
  file_version_main: number;

  /********************************************
   * Главная версия файла: объект
   ********************************************/
  @OneToOne(() => FileVersionEntity, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "file_version_main",
    foreignKeyConstraintName: "file_block_version_main_fk",
  })
  @Field(() => FileVersionEntity, {
    description: "Главная версия файла: объект",
    nullable: true,
  })
  FileVersionMain: Promise<FileVersionEntity>;


  /********************************************
   * ПОСЛЕ ЗАГРУЗКИ
   ********************************************/
  @AfterLoad()
  async setComputed(): Promise<void> {
    const fileVersions = (await this.FileVersions) ?? [];

    // количество версий: number
    this.file_version_count = fileVersions?.length ?? 0;
  }
}
