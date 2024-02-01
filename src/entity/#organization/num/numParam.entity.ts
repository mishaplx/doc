import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Нумератор: параметры" })
@Entity({ name: "num_param", schema: "sad" })
@Unique(["name"])
export class NumParamEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: "id записи",
  })
  id: number;

  /********************************************
   * Наименование
   ********************************************/
  @Column({
    nullable: false,
    comment: "Наименование",
  })
  @Field(() => String, {
    nullable: false,
    description: "Наименование",
  })
  name: string;

  /********************************************
   * Метод для получения значения
   ********************************************/
  @Column({
    nullable: false,
    comment: "Метод для получения значения",
  })
  @Field(() => String, {
    nullable: false,
    description: "Метод для получения значения",
  })
  @MaxLength(32)
  method_name: string;

  /********************************************
   * Аргумент метода для получения значения
   ********************************************/
  @Column({
    nullable: true,
    comment: "Аргумент метода для получения значения",
  })
  @Field(() => String, {
    nullable: true,
    description: "Аргумент метода для получения значения",
  })
  method_arg: string;

  /********************************************
   * Пример
   ********************************************/
  @Column({
    nullable: false,
    comment: "Пример",
  })
  @Field(() => String, {
    nullable: false,
    description: "Пример",
  })
  @MaxLength(10)
  example: string;

  /********************************************
   * Допустимость повтора
   ********************************************/
  @Column({
    nullable: false,
    default: true,
    comment: "Допустимость повтора",
  })
  @Field(() => String, {
    nullable: false,
    defaultValue: "true",
    description: "Допустимость повтора",
  })
  loop: string;

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
