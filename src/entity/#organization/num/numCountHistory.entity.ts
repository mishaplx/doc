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
import { NumEntity } from "./num.entity";

@ObjectType({ description: "Нумератор: история значений счетчика" })
@Entity({ name: "num_count_history", schema: "sad" })
export class NumCountHistoryEntity extends BaseEntity {
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
    foreignKeyConstraintName: "num_count_history_fk",
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
   * Дата записи значения счетчика
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата записи значения счетчика",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата записи значения счетчика",
  })
  date: Date;

  /********************************************
   * Значение счетчика
   ********************************************/
  @Column({
    nullable: false,
    default: 0,
    comment: "Значение счетчика",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 0,
    description: "Значение счетчика",
  })
  val: number;

  /********************************************
   * Количество неиспользованных зарезервированных номеров
   ********************************************/
  @Column({
    nullable: false,
    default: 0,
    comment: "Количество неиспользованных зарезервированных номеров",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 0,
    description: "Количество неиспользованных зарезервированных номеров",
  })
  count_reserve: number;

  /********************************************
   * Признак сброса счетчика после записи значения
   ********************************************/
  @Column({
    nullable: false,
    default: true,
    comment: "Признак сброса счетчика после записи значения",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: true,
    description: "Признак сброса счетчика после записи значения",
  })
  reset: boolean;
}
