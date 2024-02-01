import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DocEntity } from "../doc/doc.entity";
import { EmpEntity } from "../emp/emp.entity";
import { JobEntity } from "../job/job.entity";
import { ProjectEntity } from "../project/project.entity";

@ObjectType({ description: "RLS доступ по назначениям" })
@Entity({ name: "rls_access_emp", schema: "sad" })
export class RlsAccessEmpEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Emp: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Назначение",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Назначение",
  })
  emp_id: number;

  /********************************************
   * Emp: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "rlsaccessemp_emp_fk",
  })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "Назначение",
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
    foreignKeyConstraintName: "rlsaccessemp_project_fk",
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
    foreignKeyConstraintName: "rlsaccessemp_doc_fk",
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
    foreignKeyConstraintName: "rlsaccessemp_job_fk",
  })
  @Field(() => JobEntity, {
    nullable: true,
    description: "Поручение: объект",
  })
  Job: Promise<JobEntity>;

  /********************************************
   * Признак: только чтение
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Признак: только чтение",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Признак: только чтение",
  })
  read_only: boolean;
}
