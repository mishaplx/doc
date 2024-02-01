import { Field, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql/type";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";

import { EmpReplaceEntity } from "../emp_replace/emp_replace.entity";
import { FileVersionEntity } from "../file/fileVersion.entity";
import { NotifyEntity } from "../notify/notify.entity";
import { NotifyTypeEntity } from "../notify/notifyType.entity";
import { OrgEntity } from "../org/org.entity";
import { PostEntity } from "../post/post.entity";
import { ReportEntity } from "../report/report.entity";
import { RlsAccessEmpEntity } from "../rls/rls.access.emp.entity";
import { RlsGroupEntity } from "../rls/rls.group.entity";
import { RolesEntity } from "../role/role.entity";
import { UnitEntity } from "../unit/unit.entity";
import { UserEntity } from "../user/user.entity";

@ObjectType({ description: "Текущие назначения/должности сотрудников" })
@Entity({ name: "emp", schema: "sad" })
export class EmpEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field({ nullable: true })
  dtc: Date;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  del: boolean;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  temp: boolean;

  @Column({ nullable: true, comment: "Дата назначения", type: "date" })
  @Field(() => GraphQLString, {
    nullable: true,
    description: "Дата назначения",
  })
  db: Date;

  @Column({ nullable: true, comment: "Дата прекращения", type: "date" })
  @Field(() => GraphQLString, {
    nullable: true,
    description: "Дата прекращения",
  })
  de: Date;

  @Column({ nullable: true, comment: "Автор", default: false })
  @Field({ nullable: true, description: "Автор" })
  isaut: boolean;

  @Column({ nullable: true, comment: "Исполнитель", default: false })
  @Field({ nullable: true, description: "Исполнитель" })
  isexec: boolean;

  @Column({ nullable: true, comment: "Подписант", default: false })
  @Field({ nullable: true, description: "Подписант" })
  issign: boolean;

  @Column({ comment: "Организация", nullable: true })
  @Field(() => Int, { nullable: true, description: "Id организации" })
  org: number;

  @ManyToOne(() => OrgEntity, (org) => org.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "org", foreignKeyConstraintName: "emp_org_FK" })
  @Field(() => OrgEntity, { description: "Организация" })
  Org: Promise<OrgEntity>;

  @Column({ comment: "должности", nullable: true })
  @Field(() => Int, { nullable: true, description: "Id должности" })
  post_id: number;

  @ManyToOne(() => PostEntity, (post) => post.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "post_id", foreignKeyConstraintName: "post_FK" })
  @Field(() => PostEntity, { nullable: true, description: "Должность" })
  post: Promise<PostEntity>;

  @Column({ comment: "Подразделение", nullable: true })
  @Field(() => Int, { description: "Id подразделения" })
  unit_id: number;

  @ManyToOne(() => UnitEntity, (unit) => unit.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "unit_id", foreignKeyConstraintName: "unit_id_fk" })
  @Field(() => UnitEntity, { description: "Подразделение", nullable: true })
  unit: Promise<UnitEntity>;

  @Column({ comment: "Данные пользователя", nullable: true, type: "integer" })
  @Field(() => Int, { nullable: true, description: "Данные пользователя" })
  user_id: number;
  //
  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id", foreignKeyConstraintName: "user_id_fk" })
  @Field(() => UserEntity, {
    description: "Данные сотрудника",
    nullable: true,
  })
  User: Promise<UserEntity>;

  @Field(() => [RolesEntity], {
    nullable: true,
    description: "роли",
  })
  @ManyToMany(() => RolesEntity)
  @JoinTable({
    name: "emp_role",
    joinColumn: { name: "emp_id" },
    inverseJoinColumn: { name: "role_id" },
  })
  roles: RolesEntity[];

  /********************************************
   * RLS admin_api - отключена RLS политика
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Отключать RLS политику (подключение к БД как админ), роли",
  })
  @Field({
    nullable: false,
    defaultValue: false,
    description: "Отключать RLS политику (подключение к БД как админ), роли",
  })
  is_admin: boolean;

  /********************************************
   * RLS is_register - частично отключена RLS политика
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Частично отключать RLS политику (подключение к БД как пользователь), роли",
  })
  @Field({
    nullable: false,
    defaultValue: false,
    description: "Частично отключать RLS политику (подключение к БД как пользователь), роли",
  })
  is_register: boolean;

  /********************************************
   * RLS is_register_unit - частично отключена RLS политика для своего подразделения
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Частично отключать RLS политику для подразделения (подключение к БД как пользователь), роли",
  })
  @Field({
    nullable: false,
    defaultValue: false,
    description: "Частично отключать RLS политику для подразделения (подключение к БД как пользователь), роли",
  })
  is_register_unit: boolean;

  /********************************************
   * RLS доступ по назначениям
   ********************************************/
  @OneToMany(() => RlsAccessEmpEntity, (item) => item.Emp, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessEmpEntity], {
    nullable: true,
    description: "RLS доступ по назначениям",
  })
  RlsAccessEmp: Promise<RlsAccessEmpEntity[]>;

  /********************************************
   * RLS доступ по группам назначений
   ********************************************/
  @ManyToMany(() => RlsGroupEntity, {
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "rls_group_emp",
    joinColumn: { name: "emp_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "rls_group_id", referencedColumnName: "id" },
  })
  @Field(() => [RlsGroupEntity], {
    description: "RLS доступ по группам назначений",
  })
  RlsGroups: Promise<RlsGroupEntity[]>;

  /********************************************
   * Версии файла
   ********************************************/
  @OneToMany(() => FileVersionEntity, (item) => item.Emp, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileVersionEntity], {
    nullable: true,
    description: "Версии файла",
  })
  FileVersions: Promise<FileVersionEntity[]>;

  /********************************************
   * Готовые отчеты
   ********************************************/
  @OneToMany(() => ReportEntity, (item) => item.Emp, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [ReportEntity], {
    nullable: true,
    description: "Готовые отчеты",
  })
  Reports: Promise<ReportEntity[]>;

  // @Field(() => String, { nullable: true, description: 'ФИО' })
  // get fioGet() {
  //   const name = this.staff.nm[0];
  //   const lastname = this.staff.ln[0];
  //   const middlename = this.staff.mn; //фамилия
  //   return middlename + ' ' + name + '.' + lastname + '.';
  // }

  //переменная для определения какое на данный момент текущее назначение у пользоват
  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: "flag текущего назначения",
  })
  isCurrentEmpinUser: boolean;

  /********************************************
   * Назначение (кто заменяет)
   ********************************************/
  @OneToMany(() => EmpReplaceEntity, (empReplace) => empReplace.Emp_whom, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [EmpReplaceEntity], {
    nullable: true,
    description: "Назначение (кто заменяет): объект",
  })
  Emp_whom: Promise<EmpReplaceEntity[]>;

  /********************************************
   * Назначение (кого заменяет)
   ********************************************/
  @OneToMany(() => EmpReplaceEntity, (empReplace) => empReplace.Emp_who, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [EmpReplaceEntity], {
    nullable: true,
    description: "Назначение (кого заменяет): объект",
  })
  Emp_who: Promise<EmpReplaceEntity[]>;

  /********************************************
   * Сообщения подписка: объекты
   ********************************************/
  @ManyToMany(() => NotifyTypeEntity, {
    lazy: true,
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "notify_type_emp",
    joinColumn: { name: "emp_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "notify_type_id", referencedColumnName: "id" },
  })
  @Field(() => [NotifyTypeEntity], {
    description: "Сообщения подписка: объекты",
  })
  NotifyTypes: NotifyTypeEntity[]; // Promise нельзя т.к. проболемы при обновлении связи многое ко многим

  /********************************************
   * Сообщения подписка: ids
   ********************************************/
  @RelationId("NotifyTypes")
  @Field(() => [Int], {
    description: "Сообщения подписка: ids",
  })
  notify_types_ids: number[];

  /********************************************
   * Сообщения для назначения
   ********************************************/
  @OneToMany(() => NotifyEntity, (item) => item.Emp, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [NotifyEntity], {
    nullable: true,
    description: "Сообщения для назначения",
  })
  Notify: Promise<NotifyEntity[]>;
}
