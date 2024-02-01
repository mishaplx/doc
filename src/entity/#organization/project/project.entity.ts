import { Field, GraphQLISODateTime, GraphQLTimestamp, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActionsProject } from "../../../BACK_SYNC_FRONT/actions/actions.project";
import { Doc_route_actionType } from "../../../modules/projects/dto/currentroute/doc_route_action";
import { DocEntity, languagesI } from "../doc/doc.entity";
import { KdocEntity } from "../doc/kdoc.entity";
import { TdocEntity } from "../doc/tdoc.entity";
import { EmpEntity } from "../emp/emp.entity";
import { ExecInprojectRouteEntity } from "./execInprojectRoute.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";
import { NotifyEntity } from "../notify/notify.entity";
import { RlsAccessEmpEntity } from "../rls/rls.access.emp.entity";
import { RlsAccessGroupEntity } from "../rls/rls.access.group.entity";
import { SignEntity } from "../sign/sign.entity";
import { ProjectActionEntity } from "./ProjectAction.entity";
import { ProjectCurrentRouteEntity } from "./ProjectcurrentRoute.entity";
import { ProjectStatusEntity } from "./projectStatus.entity";

@ObjectType()
@Entity({ name: "projects", schema: "sad" })
export class ProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "id проекта",
    type: "int",
  })
  @Field({
    description: "id проект",
    nullable: false,
  })
  id: number;

  /********************************************
   * Исполнение проекта: объекты
   ********************************************/
  @OneToMany(() => ExecInprojectRouteEntity, (item) => item.Project, {
    //lazy: true,
    nullable: true,
    cascade: true,
  })
  @Field(() => [ExecInprojectRouteEntity], {
    nullable: true,
    description: "Исполнение проекта: объекты",
  })
  ProjectExec: Promise<ExecInprojectRouteEntity[]>;

  @Column({
    comment: "Флаг удаления записи",
    default: false,
    nullable: true,
  })
  @Field({
    description: "Флаг удаления записи",
    nullable: true,
  })
  del: boolean;

  @Column({
    comment: "Флаг временной записи",
    default: true,
  })
  @Field({
    description: "Флаг временной записи",
    defaultValue: true,
  })
  temp: boolean;

  @CreateDateColumn({
    nullable: true,
    comment: "Дата создания",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    //defaultValue: new Date(Date.now()),
    description: "Дата создания",
  })
  dtc: Date;

  @Column({
    comment: "Описание",
    type: "text",
    nullable: true,
  })
  @Field({
    description: "Описание",
    nullable: true,
  })
  description: string;

  @Column({ nullable: true, comment: "ссылка на исполнителя проекта" })
  @Field(() => Int, { nullable: true })
  executor_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "executor_id", foreignKeyConstraintName: "exec_Fk" })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "ссылка на исполнителя проекта",
  })
  Exec: Promise<EmpEntity>;

  @Column({
    comment: "Флаг подписания",
    nullable: true,
  })
  @Field({
    description: "Флаг подписания",
    nullable: true,
  })
  is_sign: boolean;

  @Column({
    comment: "Наименование",
    type: "text",
    nullable: true,
  })
  @Field({
    description: "Наименование",
    nullable: true,
    defaultValue: "Project default",
  })
  nm: string;

  @Column({
    comment: "Номер проекта",
    type: "text",
    nullable: true,
  })
  @Field({
    description: "Номер проекта",
    nullable: true,
  })
  number: string;

  @Column({
    comment: "текущий этап проекта",
    type: "int",
    nullable: true,
  })
  @Field({
    description: "текущий этап проекта",
    nullable: true,
  })
  current_stage_id: number;

  @ManyToOne(() => ProjectActionEntity, (action) => action.id, {
    nullable: true,
  })
  @Field(() => ProjectActionEntity, {
    description: "текущий этап проекта",
    nullable: true,
  })
  @JoinColumn({
    name: "current_stage_id",
    foreignKeyConstraintName: "action_FK",
  })
  CurrentStage: Promise<ProjectActionEntity>;

  @Column({
    comment: "Ссылка на родительский проект",
    type: "int",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Ссылка на родительский проект",
    nullable: true,
  })
  parent_project_id: number;

  @Column({
    comment: "Статус проекта",
    type: "int",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Статус проекта",
    nullable: true,
  })
  status_id: number;

  @ManyToOne(() => ProjectStatusEntity, (status) => status.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "status_id", foreignKeyConstraintName: "status_fk" })
  @Field(() => ProjectStatusEntity, {
    description: "Статус проекта",
    nullable: true,
  })
  Status: Promise<ProjectStatusEntity>;

  @Column({
    comment: "Тип документа проекта",
    type: "int",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Тип документа проекта",
    nullable: true,
  })
  type_document: number;

  @ManyToOne(() => KdocEntity, (kdoc) => kdoc.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "type_document",
    foreignKeyConstraintName: "type_document_id_FK",
  })
  @Field(() => KdocEntity, {
    nullable: true,
  })
  Type_doc: Promise<KdocEntity>;

  @Column({
    comment: "Вид документа",
    type: "int",
    nullable: true,
  })
  @Field(() => Int, {
    description: "Вид документа",
    nullable: true,
  })
  view_document: number;

  @ManyToOne(() => TdocEntity, (kdoc) => kdoc.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "view_document",
    foreignKeyConstraintName: "view_document_id_FK",
  })
  @Field(() => TdocEntity, { description: "Вид документа", nullable: true })
  View_doc: Promise<TdocEntity>;

  @Column({
    comment: "краткое содержание",
    type: "text",
    nullable: true,
  })
  @Field(() => String, {
    description: "краткое содержание",
    nullable: true,
  })
  short_body: string;

  /********************************************
   * Документ: объект
   ********************************************/
  @OneToOne(() => DocEntity, (item) => item.Project)
  @Field(() => DocEntity, {
    description: "Документ: объект",
    nullable: true,
  })
  Doc: Promise<DocEntity>;

  @Field(() => [Doc_route_actionType], {
    description: "маршрут проекта",
    nullable: true,
  })
  Route: Doc_route_actionType[];

  @Column({
    comment: "наименование маршрута проекта",
    type: "text",
    nullable: true,
  })
  @Field(() => String, {
    description: "наименование маршрута проекта",
    nullable: true,
  })
  route_project_name: string;

  /**
   * Ответственный
   * Под чьей учётной записью создавался проект
   */
  @Column({ nullable: true, comment: "Id ответственного" })
  @Field(() => Int, {
    nullable: true,
    description: "Id ответственного",
  })
  user_created_id: number;

  /**
   * флаг для проверки подписи карточки проекта документа перед отпракой по маршруту
   */
  @Column({
    nullable: true,
    comment: "флаг для проверки подписи карточки проекта документа перед отпракой по маршруту",
    type: "timestamp",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Id ответственного",
  })
  is_sing_date: Date;

  /**
   * флаг для проверки подписи карточки проекта документа перед отпракой по маршруту
   */
  @Field(() => Boolean, {
    nullable: true,
    description: "флаг для проверки подписи карточки проекта документа перед отпракой по маршруту",
  })
  get flagSign() {
    return !!this.is_sing_date;
  }

  /**
   * Ответственный: объект
   */
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "user_created_id",
    foreignKeyConstraintName: "project_emp_created_FK",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Ответственный",
  })
  UserCreated: Promise<EmpEntity>;

  /**
   * ЭЦП проекта
   */
  @OneToMany(() => SignEntity, (item) => item.Projects, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [SignEntity], {
    nullable: true,
    description: "ЭЦП проекта",
  })
  Sign: Promise<SignEntity[]>;

  /**
   * Прикрепленные файловые блоки
   */
  @OneToMany(() => FileBlockEntity, (file_block) => file_block.Project, {
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
  @OneToMany(() => RlsAccessEmpEntity, (item) => item.Project, {
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
  @OneToMany(() => RlsAccessGroupEntity, (item) => item.Project, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessGroupEntity], {
    nullable: true,
    description: "RLS доступ по group_id",
  })
  RlsAccessGroup: Promise<RlsAccessGroupEntity[]>;

  @Column({
    comment: "массив Языков",
    type: "json",
    nullable: true,
  })
  @Field(() => [languagesI], { nullable: true })
  languages: [languagesI];

  /********************************************
   * Сообщения по проекту
   ********************************************/
  @OneToMany(() => NotifyEntity, (item) => item.Project, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [NotifyEntity], {
    nullable: true,
    description: "Сообщения по проекту",
  })
  Notify: Promise<NotifyEntity[]>;

  /********************************************
   * Этапы маршрута
   ********************************************/
  @OneToMany(() => ProjectCurrentRouteEntity, (item) => item.Project, {
    nullable: false,
    cascade: true,
  })
  @Field(() => [ProjectCurrentRouteEntity], {
    nullable: false,
    description: "Этапы маршрута",
  })
  CurrentRoutes: Promise<ProjectCurrentRouteEntity[]>;

  /********************************************
   * Доступные операции (заполнение в getProjectsById)
   ********************************************/
  @Field(() => [String], {
    defaultValue: [],
    description:
      "!!! ТОЛЬКО ДЛЯ getProjectsById !!!\n\nДоступные операции (список): " +
      Object.values(ActionsProject).join(", "),
  })
  EnablingActions: string[];

  @Field(() => Boolean, {
    nullable: true,
    description: "Является ли проект избранным)",
  })
  isFavorites?: boolean;
}
