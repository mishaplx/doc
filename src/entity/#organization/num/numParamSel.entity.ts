import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { NumEntity } from "./num.entity";
import { NumParamEntity } from "./numParam.entity";

@ObjectType({ description: "Выбранные параметры нумератора" })
@Entity({ name: "num_param_sel", schema: "sad" })
@Unique(["num_id", "num_param_id", "sort"])
export class NumParamSelEntity {
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
  @JoinColumn({ name: "num_id" })
  @Field(() => NumEntity, {
    description: "Нумератор: объект",
  })
  Num: Promise<NumEntity>;

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
   * Параметр: объект
   ********************************************/
  @ManyToOne(() => NumParamEntity, (num) => num.id, {
    lazy: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "num_param_id" })
  @Field(() => NumParamEntity, {
    description: "Параметр: объект",
  })
  NumParam: Promise<NumParamEntity>;

  /********************************************
   * Параметр: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Параметр: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Параметр: id",
  })
  num_param_id: number;

  /********************************************
   * Значение параметра
   ********************************************/
  @Column({
    nullable: true,
    comment: "Значение параметра",
  })
  @Field(() => String, {
    nullable: true,
    description: "Значение параметра",
  })
  value: string;

  /********************************************
   * Сортировка по возрастанию значения
   ********************************************/
  @Column({
    nullable: false,
    comment: "Сортировка по возрастанию значения",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Сортировка по возрастанию значения",
  })
  sort: number;
}
