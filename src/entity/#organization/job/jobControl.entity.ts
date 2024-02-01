import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { EmpEntity } from "../emp/emp.entity";
import { JobEntity } from "./job.entity";
import { JobsControlTypesEntity } from "./jobControlTypes.entity";

@ObjectType({ description: "Контроль поручения" })
@Entity({ name: "job_control", schema: "sad" })
export class JobControlEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Index()
  @Column({ comment: "Поручение" })
  @Field(() => Int, { description: "Id поручения" })
  job_id: number;

  @ManyToOne(() => JobEntity, (job) => job.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "job_id", foreignKeyConstraintName: "job_id_fk" })
  @Field(() => JobEntity, { description: 'Сущность "Поручение"' })
  Job: Promise<JobEntity>;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ comment: "Тип Контроля" })
  @Field(() => Int, { description: 'Id справочника "Тип Контроля"' })
  job_control_type_id: number;

  @ManyToOne(() => JobsControlTypesEntity, (jobCntrType) => jobCntrType.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_control_type_id",
    foreignKeyConstraintName: "job_control_type_id_fk",
  })
  @Field(() => JobsControlTypesEntity, {
    description: 'Сущность "Тип Контроля"',
  })
  JobControlType: Promise<JobsControlTypesEntity>;

  /**
   * Плановая дата исполнения поручения.
   */
  @Column({ nullable: true, comment: "Плановая дата" })
  @Field({ nullable: true, description: "Плановая дата" })
  date_plan: Date;

  /**
   * Фактическая дата исполнения поручения (дата снятия поручения с контроля).
   */
  @Column({ nullable: true, comment: "Фактическая дата" })
  @Field({ nullable: true, description: "Фактическая дата" })
  date_fact: Date;

  @Column({ nullable: true, comment: "Предконтролер" })
  @Field(() => Int, { nullable: true, description: "Id предконтролера" })
  prev_controller_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "prev_controller_id",
    foreignKeyConstraintName: "prev_controller_id_FK",
  })
  @Field(() => EmpEntity, { nullable: true, description: "Предконтролер" })
  PrevController: Promise<EmpEntity>;

  @Index()
  @Column({ nullable: true, comment: "Контролер" })
  @Field(() => Int, { nullable: true, description: "Id контролера" })
  controller_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "controller_id",
    foreignKeyConstraintName: "controller_id_FL",
  })
  @Field(() => EmpEntity, { nullable: true, description: "Контролер" })
  Controller: Promise<EmpEntity>;

  /**
   * Комментарий предконтроля по выполнению поручения.
   */
  @Column({ nullable: true, comment: "Результат предконтроля", type: "text" })
  @Field({ nullable: true, description: "Результат предконтроля" })
  prev_controller_result: string;

  /**
   * Комментарий контроля по выполнению поручения.
   */
  @Column({ nullable: true, comment: "Результат контроля", length: 300 })
  @Field({ nullable: true, description: "Результат контроля" })
  controller_result: string;
}
