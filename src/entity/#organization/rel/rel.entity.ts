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

import { DocEntity } from "../doc/doc.entity";
import { RelTypesEntity } from "./relTypes.entity";

@ObjectType({ description: "Связки документов" })
@Entity({ name: "rel", schema: "sad" })
// @Unique('doc_id_index',['doc_direct_id', 'doc_reverse_id'])
@Index(["rel_types_id", "doc_direct_id", "doc_reverse_id"], { unique: true })
export class RelEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************/
  @ManyToOne(() => RelTypesEntity, (rel_types) => rel_types.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "rel_types_id",
    foreignKeyConstraintName: "rel_types_id_fk",
  })
  @Field(() => RelTypesEntity, {
    nullable: false,
    description: "Тип связки: объект",
  })
  RelTypes: Promise<RelTypesEntity>;

  /********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Тип связки: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Тип связки: id",
  })
  rel_types_id: number;

  /********************************************/
  @ManyToOne(() => DocEntity, (doc) => doc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_direct_id",
    foreignKeyConstraintName: "rel_doc_direct_id_fk",
  })
  @Field(() => DocEntity, {
    nullable: false,
    description: "Прямая связка: объект",
  })
  DocDirect: Promise<DocEntity>;

  /********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Прямая связка: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Прямая связка: id",
  })
  doc_direct_id: number;

  /********************************************/
  @ManyToOne(() => DocEntity, (doc) => doc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_reverse_id",
    foreignKeyConstraintName: "rel_doc_reverse_id_fk",
  })
  @Field(() => DocEntity, {
    nullable: false,
    description: "Обратная связка: объект",
  })
  DocReverse: Promise<DocEntity>;

  /********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Обратная связка: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Обратная связка: id",
  })
  doc_reverse_id: number;

  /********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания",
  })
  date_create: Date;

  /********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Признак удаления",
  })
  @Field({
    nullable: false,
    defaultValue: false,
    description: "Признак удаления",
  })
  del: boolean;
}
