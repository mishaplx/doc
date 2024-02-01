import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { ActionType } from "../../../modules/projects/dto/ActionType";
import { KdocEntity } from "../doc/kdoc.entity";
import { TdocEntity } from "../doc/tdoc.entity";

@ObjectType()
@Entity({ name: "template_route_project", schema: "sad" }) // таблица шаблонов маршрутов проекта документа
@Unique(["name"])
export class TemplateRouteProjectEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({
    comment: "Тип документа проекта",
    type: "int",
  })
  @Field(() => Int, {
    description: "Тип документа проекта",
    nullable: true,
  })
  type_document: number;
  @ManyToOne(() => KdocEntity, (kdoc) => kdoc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "type_document" })
  @Field(() => KdocEntity, {
    description: "Тип документа проекта",
    nullable: true,
  })
  Typedoc: Promise<KdocEntity>;

  @Column({
    comment: "Вид документа",
    type: "int",
  })
  @Field(() => Int, {
    description: "Вид документа",
    nullable: true,
  })
  view_document: number;

  @ManyToOne(() => TdocEntity, (tdoc) => tdoc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "view_document" })
  @Field(() => TdocEntity, {
    description: "Тип документа проекта",
    nullable: true,
  })
  Viewdoc: Promise<TdocEntity>;

  @Column({
    comment: "наименование маршрута для проектов документа",
    type: "text",
  })
  @Field(() => String, {
    description: "наименование маршрута для проектов документа",
    nullable: true,
  })
  name: number;

  @Column({
    comment: "массив маршрута документа",
    type: "simple-array",
  })
  @Field(() => [Int], {
    description: "массив маршрута документа",
    nullable: true,
  })
  doc_route: number[];

  @Column({
    comment: "дополнительные действия наименование маршрута для проектов документа",
    type: "simple-json",
  })
  @Field(() => [ActionType], {
    description: "дополнительные действия наименование маршрута для проектов документа ",
    nullable: true,
  })
  doc_route_action: ActionType[];

  @Field(() => [String], {
    description: "doc route name",
    nullable: true,
  })
  doc_route_name: string[];

  @Column({ nullable: true, default: false, comment: "Флаг временной записи" })
  @Field({ nullable: true, description: "Флаг временной записи" })
  temp: boolean;

  @Column({ nullable: true, default: false, comment: "Флаг удаления" })
  @Field({ nullable: true, description: "Флаг удаления" })
  del: boolean;
}
