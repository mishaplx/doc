import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { JobEntity } from "./job.entity";

@ObjectType({ description: "Запросы и решения по утверждению поручения" })
@Entity({ name: "jobs_approve", schema: "sad" })
export class JobApproveEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "ID операции" })
  @Field(() => Int, { description: "ID операции" })
  id: number;

  /**
   * JOB: Поручение
   */
  @Column({ nullable: false, comment: "JOB: поручение" })
  @Field(() => Int, { nullable: false, description: "JOB: id поручения" })
  job_id: number;

  /** JOB: Поручение */
  @Index()
  @ManyToOne(() => JobEntity, (job) => job.id, {
    lazy: true,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "job_approv_FK",
  })
  @Field(() => JobEntity, {
    nullable: false,
    description: "JOB: поручение",
  })
  Job: Promise<JobEntity>;

  /**
   * EMP: автор запроса
   */
  @Column({ nullable: false, comment: "EMP: автор запроса" })
  @Field(() => Int, { nullable: false, description: "EMP: id автора запроса" })
  emp_id_request: number;

  /** EMP: автор запроса */
  @Index()
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    lazy: true,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "emp_id_request", foreignKeyConstraintName: "emp_approv_request_FK" })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "EMP: автор запроса",
  })
  Emp_request: Promise<EmpEntity>;

  /**
   * EMP: автор решения
   */
  @Column({ nullable: true, comment: "EMP: автор решения" })
  @Field(() => Int, { nullable: true, description: "EMP: id автора решения" })
  emp_id_resolv: number;

  /** EMP: автор решения */
  @Index()
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    lazy: true,
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id_resolv",
    foreignKeyConstraintName: "emp_approv_resolv_FK",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "EMP: автор решения",
  })
  Emp_resolv: Promise<EmpEntity>;

  /**
   * Пояснение решения
   */
  @Column({
    nullable: true,
    comment: "Пояснение решения",
    length: 300,
  })
  @Field({
    nullable: true,
    description: "Пояснение решения",
  })
  note_resolv: string;

  /**
   * Дата запроса
   */
  @Column({
    nullable: false,
    comment: "Дата запроса",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата запроса",
  })
  date_request: Date;

  /**
   * Дата решения
   */
  @Column({
    nullable: true,
    comment: "Дата решения",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата решения",
  })
  date_resolv: Date;

  /**
   * Признак положительного рассмотрения
   */
  @Column({
    nullable: true,
    // default: false,
    comment: "Признак утверждения поручения",
  })
  @Field(() => Boolean, {
    nullable: true,
    description: "Признак утверждения поручения",
  })
  approved: boolean;
}
