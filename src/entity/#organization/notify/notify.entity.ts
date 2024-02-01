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

import { PsBaseEnum } from "../../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { DocEntity } from "../doc/doc.entity";
import { EmpEntity } from "../emp/emp.entity";
import { JobEntity } from "../job/job.entity";
import { ProjectEntity } from "../project/project.entity";
import { NotifyTypeEntity } from "./notifyType.entity";

@ObjectType({ description: "Уведомления" })
@Entity({ name: "notify", schema: "sad" })
export class NotifyEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Сообщение
   ********************************************/
  @Column({
    nullable: true,
    comment: "Сообщение",
  })
  @Field(() => String, {
    nullable: true,
    description: "Сообщение",
  })
  message: string;

  /********************************************
   * Вид сообщения (инфо, ошибка, предупреждение, ок)
   ********************************************/
  @Column({
    type: "enum",
    enum: PsBaseEnum,
    nullable: false,
    default: PsBaseEnum.info,
    comment: "Вид сообщения (инфо, ошибка, предупреждение, ок, sys)",
  })
  @Field(() => PsBaseEnum, {
    nullable: false,
    defaultValue: PsBaseEnum.info,
    description: "Вид сообщения (инфо, ошибка, предупреждение, ок, sys)",
  })
  kind: PsBaseEnum;

  /********************************************
   * Тип сообщения: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Тип сообщения: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Тип сообщения: id",
  })
  notify_type_id: number;

  /********************************************
   * Тип сообщения: объект
   ********************************************/
  @ManyToOne(() => NotifyTypeEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "notify_type_id",
    foreignKeyConstraintName: "notify_type_notify_fk",
  })
  @Field(() => NotifyTypeEntity, {
    nullable: false,
    description: "Тип сообщения: объект",
  })
  NotifyType: Promise<NotifyTypeEntity>;

  /********************************************
   * Назначение: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Кому - Назначение: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Кому - Назначение: id",
  })
  emp_id: number;

  /********************************************
   * Назначение: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "emp_notify_fk",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Назначение: объект",
  })
  Emp: Promise<EmpEntity>;

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
    foreignKeyConstraintName: "project_notify_fk",
  })
  @Field(() => ProjectEntity, {
    nullable: true,
    description: "Проект: объект",
  })
  Project: Promise<ProjectEntity>;

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
    foreignKeyConstraintName: "doc_notify_fk",
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
    foreignKeyConstraintName: "job_notify_fk",
  })
  @Field(() => JobEntity, {
    nullable: true,
    description: "Поручение: объект",
  })
  Job: Promise<JobEntity>;

  // /********************************************
  //  * Отчет: id
  //  ********************************************/
  // @Index()
  // @Column({
  //   comment: 'Отчет: id',
  //   type: 'number',
  //   nullable: true,
  // })
  // @Field(() => Int, {
  //   description: 'Отчет: id',
  //   nullable: true,
  // })
  // report_id: number;

  // /********************************************
  //  * Отчет: объект
  //  ********************************************/
  // @OneToOne(() => ReportEntity, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn({
  //   name: 'report_id',
  //   foreignKeyConstraintName: 'report_notify_fk',
  // })
  // @Field(() => ReportEntity, {
  //   description: 'Отчет: объект',
  //   nullable: true,
  // })
  // Report: Promise<ReportEntity>;

  /********************************************
   * Дата создания
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    defaultValue: new Date(),
    description: "Дата создания",
  })
  date_create: Date;

  /********************************************
   * Дата контроля
   ********************************************/
  @Column({
    type: "timestamp",
    nullable: true,
    comment: "Дата контроля",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата контроля",
  })
  date_control: Date;

  /********************************************
   * Дата просмотра
   ********************************************/
  @Column({
    type: "timestamp",
    nullable: true,
    comment: "Дата просмотра",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата просмотра",
  })
  date_view: Date;
}
