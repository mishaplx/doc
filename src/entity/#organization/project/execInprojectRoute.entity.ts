import { ArgsType, Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";
import { ProjectActionEntity } from "./ProjectAction.entity";
import { ProjectEntity } from "./project.entity";

/*
 * Таблица Исполнителей на определенный этап проекта
 */
@ArgsType()
@ObjectType()
@Entity({ name: "exec_in_project_route", schema: "sad" })
export class ExecInprojectRouteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /**
   * Признак удаления
   */
  @Column({
    nullable: false,
    default: false,
  })
  @Field({
    nullable: false,
    defaultValue: false,
  })
  del: boolean;

  /**
   * Признак шаблона
   */
  @Column({
    nullable: true,
  })
  @Field({
    nullable: true,
  })
  temp: boolean;

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
    lazy: true,
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "project_id",
    foreignKeyConstraintName: "project_execproject_fk",
  })
  @Field(() => ProjectEntity, {
    nullable: true,
    description: "Проект: объект",
  })
  Project: Promise<ProjectEntity>;

  @Column({
    nullable: true,
    comment: "очередь",
  })
  @Field(() => Int, {
    nullable: true,
    description: "очередь",
  })
  queue: number;

  /********************************************
   * Действие: id
   ********************************************/
  @Column({
    nullable: false,
    comment: "Проект: id",
  })
  @Field({
    nullable: false,
    description: "Проект: id",
  })
  stage_id: number;

  /********************************************
   * Действие: объект
   ********************************************/
  @ManyToOne(() => ProjectActionEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "stage_id",
    foreignKeyConstraintName: "project_project_action_fk",
  })
  @Field(() => ProjectActionEntity, {
    nullable: false,
    description: "Действие: объект",
  })
  Stage: Promise<ProjectActionEntity>;

  @Column({
    comment: "Дата  фактическая",
    type: "timestamp with time zone",
    nullable: true,
  })
  @Field({
    description: "Дата  фактическая",
    nullable: true,
  })
  date_fact: Date;

  @Column({
    comment: "Дата запланированная",
    type: "timestamp with time zone",
    nullable: true,
  })
  @Field(() => GraphQLISODateTime, {
    description: "Дата запланированная",
    nullable: true,
  })
  date_plan: Date;

  @Column({
    nullable: true,
    type: "text",
    comment: "результат",
  })
  @Field(() => String, {
    nullable: true,
    description: "результат",
  })
  result: string;

  /********************************************
   * Файл замечаний к исполнению проекта документа: объект
   ********************************************/
  @OneToOne(() => FileBlockEntity, (item) => item.ProjectExec)
  @Field(() => FileBlockEntity, {
    description: "Файл замечаний к исполнению проекта документа: объект",
    nullable: true,
  })
  FileBlock: Promise<FileBlockEntity>;

  @Column({
    nullable: true,
    type: "text",
    comment: "замечание",
  })
  @Field(() => String, {
    nullable: true,
    description: "замечание",
  })
  remark: string;

  @Column({
    nullable: true,
    type: "text",
    comment: "примечание",
  })
  @Field(() => String, {
    nullable: true,
    description: "примечание",
  })
  note: string;

  /********************************************
   * id исполнителя кто добавил текущего исполнителя на этап
   ********************************************/
  @Column({
    nullable: true,
    comment: "id исполнителя кто добавил текущего исполнителя на этап",
  })
  parent_exec_id: number;

  /********************************************
   * Назначение исполнителя проекта: id
   ********************************************/
  @Column({
    nullable: true,
    comment: "Назначение исполнителя проекта: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Назначение исполнителя проекта: id",
  })
  executor_id: number;

  /********************************************
   * Назначение исполнителя проекта: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "executor_id",
    foreignKeyConstraintName: "execinprojectroute_emp_Fk",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Назначение исполнителя проекта: объект",
  })
  Exec: Promise<EmpEntity>;
}
