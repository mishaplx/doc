import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DocEntity } from "../doc/doc.entity";
import { EmpEntity } from "../emp/emp.entity";
import { FileItemEntity } from "../file/fileItem.entity";
import { JobEntity } from "../job/job.entity";
import { ProjectEntity } from "../project/project.entity";

@ObjectType({ description: "ЭЦП" })
@Entity({ name: "sign", schema: "sad" })
export class SignEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Файл: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Файл: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Файл: id",
  })
  file_item_id: number;

  /********************************************
   * Файл: объект
   ********************************************/
  @ManyToOne(() => FileItemEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "file_item_id",
    foreignKeyConstraintName: "sign_fileitem_fk",
  })
  @Field(() => FileItemEntity, {
    nullable: true,
    description: "Файл: объект",
  })
  FileItem: Promise<FileItemEntity>;

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
  @ManyToOne(() => DocEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_id",
    foreignKeyConstraintName: "sign_doc_fk",
  })
  @Field(() => FileItemEntity, {
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
  @ManyToOne(() => JobEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "sign_job_fk",
  })
  @Field(() => JobEntity, {
    nullable: true,
    description: "Поручение: объект",
  })
  Job: Promise<JobEntity>;

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
  @ManyToOne(() => ProjectEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "project_id",
    foreignKeyConstraintName: "sign_project_fk",
  })
  @Field(() => ProjectEntity, {
    nullable: true,
    description: "Проект: объект",
  })
  Projects: Promise<ProjectEntity>;

  /********************************************
   * Содержание подписи
   ********************************************/
  @Column({
    type: "text",
    nullable: false,
    comment: "Содержание подписи",
  })
  @Field(() => String, {
    nullable: false,
    description: "Содержание подписи",
  })
  sign: string;

  /********************************************
   * Дата создания подписи
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания подписи",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания подписи",
  })
  date_create: Date;

  /********************************************
   * ЗАДАЧА: Проверить подпись
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ЗАДАЧА: Проверить подпись",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ЗАДАЧА: Проверить подпись",
  })
  task_verify: boolean;

  /********************************************
   * ОШИБКА: Проверить подпись
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ОШИБКА: Проверить подпись",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ОШИБКА: Проверить подпись",
  })
  fail_verify: boolean;

  /********************************************
   * Дата последней проверки подписи
   ********************************************/
  @Column({
    nullable: true,
    comment: "Дата последней проверки подписи",
  })
  @Field({
    nullable: true,
    description: "Дата последней проверки подписи",
  })
  date_verify: Date;

  /********************************************
   * Результат последней проверки подписи
   ********************************************/
  @Column({
    nullable: true,
    comment: "Результат последней проверки подписи",
  })
  @Field({
    nullable: true,
    description: "Результат последней проверки подписи",
  })
  valid: boolean;

  /********************************************
   * Содержание ошибки последней проверки
   ********************************************/
  @Column({
    nullable: false,
    default: "",
    comment: "Содержание ошибки последней проверки",
  })
  @Field({
    nullable: false,
    defaultValue: "",
    description: "Содержание ошибки последней проверки",
  })
  error: string;

  /********************************************
   * Сведения о подписи
   ********************************************/
  @Column({
    nullable: false,
    default: "",
    comment: "Сведения о подписи",
  })
  @Field({
    nullable: false,
    defaultValue: "",
    description: "Сведения о подписи",
  })
  info: string;

  /********************************************
   * Автор: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Автор: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Автор: id",
  })
  emp_id: number;

  /********************************************
   * Автор: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "emp_sign_fk",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Автор: объект",
  })
  Emp: Promise<EmpEntity>;
}
