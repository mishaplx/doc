import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TdocEntity } from "../doc/tdoc.entity";
import { FileItemEntity } from "../file/fileItem.entity";

// Это шаблоны проектов.
@ObjectType()
@Entity({ name: "project_template", schema: "sad" })
export class ProjectTemplateEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование шаблона проекта" })
  @Field({ nullable: false })
  nm: string;

  /********************************************
   * Файл: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Файл: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Файл: id",
  })
  file_item_id: number;

  /********************************************
   * Файл: объект
   ********************************************/
  @ManyToOne(() => FileItemEntity, (item) => item.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "file_item_id",
    foreignKeyConstraintName: "project_template_fileitem_fk",
  })
  @Field(() => FileItemEntity, {
    nullable: true,
    description: "Файл: объект",
  })
  FileItem: Promise<FileItemEntity>;

  @Column({ nullable: true, comment: "Вид документа" })
  @Field(() => Int, { nullable: true, description: "Id вид документа" })
  tdoc: number;

  @ManyToOne(() => TdocEntity, (tdoc) => tdoc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "tdoc", foreignKeyConstraintName: "tdoc_FK" })
  @Field(() => TdocEntity, {
    nullable: true,
    description: 'Сущность "Вид документа"',
  })
  Tdoc: Promise<TdocEntity>;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;
}
