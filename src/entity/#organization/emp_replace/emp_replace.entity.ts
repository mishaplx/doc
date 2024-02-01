import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { changeDateToEndDay } from "../../../modules/emp/emp.utils";
import { EmpEntity } from "../emp/emp.entity";

@ObjectType("EmpReplace")
@Entity({ name: "emp_replace", schema: "sad" })
export class EmpReplaceEntity extends BaseEntity {
  //extends BaseEntity
  @PrimaryGeneratedColumn()
  @Field(() => Int, { description: "ID" })
  id!: number;

  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ default: false })
  @Field({
    description: "флаг удаления записи",
    nullable: true,
  })
  del: boolean;

  @Column({ default: false, nullable: false })
  temp: boolean;

  /********************************************
   * Назначение (кто заменяет)
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Назначение (кто заменяет): id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Назначение (кто заменяет): id",
  })
  emp_who: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_who",
    foreignKeyConstraintName: "emp_emp_who_fk",
  })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "Назначение (кто заменяет): объект",
  })
  Emp_who: Promise<EmpEntity>;

  /********************************************
   * Назначение (кого заменяет)
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Назначение (кого заменяет): id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Назначение (кого заменяет): id",
  })
  emp_whom: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_whom",
    foreignKeyConstraintName: "emp_emp_whom_fk",
  })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "Назначение (кого заменяет): объект",
  })
  Emp_whom: Promise<EmpEntity>;

  /********************************************
   * Должность (кто заменяет)
   ********************************************/
  @Field(() => Int, {
    nullable: false,
    description: "Должность (кто заменяет): id",
  })
  post_who: number;

  /********************************************
   * Должность (кого заменяет)
   ********************************************/
  @Field(() => Int, {
    nullable: false,
    description: "Должность (кого заменяет): id",
  })
  post_whom: number;

  @Column({ type: "boolean", comment: "Флаг активации записи", default: true })
  @Field({
    description: "Флаг активации записи",
    nullable: false,
    defaultValue: true,
  })
  activate: boolean;

  @Column({ comment: "дата замены С какого числа", type: "timestamp" })
  @Field(() => GraphQLISODateTime, {
    description: "дата замены С какого числа",
    nullable: false,
    middleware: [changeDateToEndDay],
  })
  date_start: Date;

  @Column({ comment: "дата замены ПО какое число", type: "timestamp" })
  @Field(() => GraphQLISODateTime, {
    description: "дата замены ПО какое число",
    nullable: false,
    middleware: [changeDateToEndDay],
  })
  date_end: Date;
}
