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
  Unique,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { NumEntity } from "./num.entity";

@ObjectType({ description: "Нумератор: зарезервированные значения счетчика" })
@Entity({ name: "num_count_reserve", schema: "sad" })
@Unique(["num_id", "val"])
export class NumCountReserveEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /********************************************
   * Нумератор: объект
   ********************************************/
  @ManyToOne(() => NumEntity, (num) => num.id, {
    lazy: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "num_id",
    foreignKeyConstraintName: "num_count_reserve_fk",
  })
  @Field(() => NumEntity, {
    nullable: false,
    description: "Нумератор: объект",
  })
  NumCount: Promise<NumEntity>;

  /********************************************
   * Нумератор: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Нумератор: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Нумератор: id",
  })
  num_id: number;

  /********************************************
   * Кто зарезервировал: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    lazy: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "num_count_reverse_emp_id_fk",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Кто зарезервировал: объект",
  })
  Emp: Promise<EmpEntity>;

  /********************************************
   * Кто зарезервировал: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Кто зарезервировал: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Кто зарезервировал: id",
  })
  emp_id: number;

  /********************************************
   * Дата резервирования значения счетчика
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата резервирования значения счетчика",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    defaultValue: new Date(),
    description: "Дата резервирования значения счетчика",
  })
  date: Date;

  /********************************************
   * Резервируемое значение счетчика
   ********************************************/
  @Column({
    nullable: false,
    default: 0,
    comment: "Резервируемое значение счетчика",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 0,
    description: "Резервируемое значение счетчика",
  })
  val: number;

  /********************************************
   * Освобожденное но не взятое значение счетчика
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Освобожденное но не взятое значение счетчика",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Освобожденное но не взятое значение счетчика",
  })
  val_free: boolean;

  /********************************************
   * Примечание
   ********************************************/
  @Column({
    nullable: true,
    comment: "Примечание",
  })
  @Field(() => String, {
    nullable: true,
    description: "Примечание",
  })
  note: string;
}
