import { ArgsType, Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ActEntity } from "../act/act.entity";

@ArgsType()
@ObjectType({ description: "Удалённые дела" })
@Entity({ name: "doc_package_deleted", schema: "sad" })
export class DocPackageDeletedEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn({ comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, { description: "Дата создания" })
  dtc: Date;

  @Column({ comment: "Год" })
  @Field(() => Int, { description: "Год" })
  year: number;

  @Column({ comment: "Индекс", type: "text" })
  @Field({ description: "Индекс" })
  index: string;

  @Column({ comment: "Заголовок", type: "text" })
  @Field({ description: "Заголовок" })
  title: string;

  @Column({ comment: "Начальная дата документов", type: "date" })
  @Field(() => GraphQLString, { description: "Начальная дата документов" })
  start_date: Date;

  @Column({ comment: "Конечная дата документов", type: "date" })
  @Field(() => GraphQLString, { description: "Конечная дата документов" })
  end_date: Date;

  @Column({ comment: "Количество документов" })
  @Field(() => Int, { description: "Количество документов" })
  count_doc: number;

  @Column({ comment: "Количество файлов" })
  @Field(() => Int, { description: "Количество файлов" })
  count_file: number;

  @Column({ comment: "Срок хранения", type: "text" })
  @Field({ description: "Срок хранения" })
  storage_period: string;

  @Column({ comment: "Статья хранения", type: "text" })
  @Field({ description: "Статья хранения" })
  article_storage: string;

  @Column({ nullable: true, comment: "Комментарий по хранению", type: "text" })
  @Field({ nullable: true, description: "Комментарий по хранению" })
  comment: string;

  @Column({ nullable: true, comment: "Примечание", type: "text" })
  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Column({ comment: "Акт" })
  @Field(() => Int, { description: "Акт" })
  act_id: number;

  @ManyToOne(() => ActEntity, (act) => act.id)
  @JoinColumn({ name: "act_id" })
  Act: Promise<ActEntity>;
}
