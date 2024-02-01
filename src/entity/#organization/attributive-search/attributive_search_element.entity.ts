import { Field, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Атрибутивный поиск" })
@Entity({ name: "attributive_search_element", schema: "sad" })
export class AttributiveSearchElementEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /** Название атрибута */
  @Column({ nullable: true, type: "text", comment: "Название атрибута" })
  @Field({ nullable: true, description: "Название атрибута" })
  name: string;

  /** Тип атрибута */
  @Column({ nullable: true, type: "text", comment: "Тип атрибута" })
  @Field({ nullable: true, description: "Тип атрибута" })
  type: string;

  /** Название таблицы */
  @Column({ nullable: true, type: "text", comment: "Название таблицы" })
  @Field({ nullable: true, description: "Название таблицы" })
  db_table_name: string;

  /** Соответствующее имя колонки в таблице сущности */
  @Column({
    nullable: true,
    type: "text",
    comment: "Соответствующее имя колонки в таблице сущности",
  })
  @Field({
    nullable: true,
    description: "Соответствующее имя колонки в таблице сущности",
  })
  db_column_name: string;

  /** Доступные операции атрибута */
  @Column({ nullable: true, type: "json", comment: "Доступные операции атрибута" })
  @Field(() => JSON, {
    nullable: true,
    description: "Доступные операции атрибута",
  })
  actions: any;

  /** Доступные значения атрибута */
  @Column({ nullable: true, type: "json", comment: "Доступные значения атрибута" })
  @Field(() => JSON, {
    nullable: true,
    description: "Доступные значения атрибута",
  })
  values: any;

  @Column({ default: false, comment: "флаг удаления записи" })
  @Field({
    description: "флаг удаления записи",
    nullable: true,
  })
  del: boolean;
}
