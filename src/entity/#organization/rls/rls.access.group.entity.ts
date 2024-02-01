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
import { JobEntity } from "../job/job.entity";
import { ProjectEntity } from "../project/project.entity";
import { RlsGroupEntity } from "./rls.group.entity";

@ObjectType({ description: "RLS доступ по группам назначений" })
@Entity({ name: "rls_access_group", schema: "sad" })
export class RlsAccessGroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * RLS группа: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "RLS группа: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "RLS группа: id",
  })
  rls_group_id: number;

  /********************************************
   * RLS группа: объект
   ********************************************/
  @ManyToOne(() => RlsGroupEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "rls_group_id",
    foreignKeyConstraintName: "rlsaccessgroup_group_fk",
  })
  @Field(() => RlsGroupEntity, {
    nullable: false,
    description: "RLS группа: объект",
  })
  RlsGroup: Promise<RlsGroupEntity>;

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
    foreignKeyConstraintName: "rlsaccessgroup_project_fk",
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
  @ManyToOne(() => DocEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_id",
    foreignKeyConstraintName: "rlsaccessgroup_doc_fk",
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
  @ManyToOne(() => JobEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "rlsaccessgroup_job_fk",
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
