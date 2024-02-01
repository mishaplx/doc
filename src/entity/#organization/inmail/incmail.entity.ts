import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FileBlockEntity } from "../file/fileBlock.entity";

@ObjectType()
@Entity({ name: "incmail", schema: "sad" })
export class IncmailEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Почтовый ящик: куда" })
  email?: string;

  @Column({ nullable: true })
  @Field({
    nullable: true,
    description: "Идентификатор, который идентифицирует сообщение в его почтовом ящике",
  })
  uid?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "От" })
  sender?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Тема" })
  subject?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Тело сообщения в виде открытого текста" })
  body?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Текстовое тело сообщения в формате HTML" })
  html?: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Дата" })
  dt?: Date;

  /********************************************
   * Прикрепленные файловые блоки
   ********************************************/
  @OneToMany(() => FileBlockEntity, (file_block) => file_block.Incmail, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileBlockEntity], {
    nullable: true,
    description: "Прикрепленные файловые блоки",
  })
  FileBlock: Promise<FileBlockEntity[]>;
}
