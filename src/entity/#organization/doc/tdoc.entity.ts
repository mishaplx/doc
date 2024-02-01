import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { IsDate } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/*
Вид документа
 */
@ObjectType({ description: "Получение данных вида документа " })
@Entity({ name: "tdoc", schema: "sad" })
@Index(["nm"], { unique: true, where: "del = false AND temp = false" })
export class TdocEntity extends BaseEntity {
  @Column({ nullable: false })
  @Field({ nullable: false })
  nm: string;

  @CreateDateColumn()
  @Field(() => GraphQLISODateTime)
  @IsDate()
  dtc: Date;

  @Column({ default: false, comment: "Флаг удаления" })
  @Field({ nullable: false, description: "Флаг удаления" })
  del: boolean;

  @Column({ comment: "Флаг временной записи" })
  @Field({ nullable: false, description: "Флаг временной записи" })
  temp: boolean;

  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, type: "text", comment: "Типы документов в СМДО: наименование" })
  @Field({ nullable: true, description: "Типы документов в СМДО: наименование" })
  smdoDocTypes: string;

  @Column({ nullable: false, default: true, comment: "доступность для изменения" })
  @Field({ nullable: false, description: "доступность для изменения" })
  can_be_edited: boolean;

  @Column({ nullable: true, comment: "Код вида документа", length: 3 })
  @Field({ nullable: true, description: "Код вида документа" })
  code: string;
}
