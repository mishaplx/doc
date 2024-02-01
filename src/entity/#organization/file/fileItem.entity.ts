import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SignEntity } from "../sign/sign.entity";
import { FileVersionEntity } from "./fileVersion.entity";

@ObjectType({ description: "Хранение файлов" })
@Entity({ name: "file_item", schema: "sad" })
export class FileItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Запись в таблице версий: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Запись в таблице версий: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Запись в таблице версий: id",
  })
  file_version_id: number;

  /********************************************
   * Запись в таблице версий: объект
   ********************************************/
  @ManyToOne(() => FileVersionEntity, (file_version) => file_version.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "file_version_id",
    foreignKeyConstraintName: "fileversion_fileitem_fk",
  })
  @Field(() => FileVersionEntity, {
    nullable: false,
    description: "Запись в таблице версий: объект",
  })
  FileVersion: Promise<FileVersionEntity>;

  /********************************************
   * Наименование файла в VOLUME
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Наименование файла в VOLUME",
  })
  @Field(() => String, {
    nullable: false,
    description: "Наименование файла в VOLUME",
  })
  volume: string;

  /********************************************
   * Расширение файла (без точки)
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Расширение файла (без точки)",
  })
  @Field(() => String, {
    nullable: false,
    description: "Расширение файла (без точки)",
  })
  ext: string;

  /********************************************
   * Дата создания файла
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания файла",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания файла",
  })
  date_create: Date;

  /********************************************
   * Главный файл
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Главный файл",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Главный файл",
  })
  main: boolean;

  /********************************************
   * Формат PDF
   ********************************************/
  @Column({
    nullable: false,
    default: "",
    comment: "Формат PDF",
  })
  @Field(() => String, {
    nullable: false,
    defaultValue: "",
    description: "Формат PDF",
  })
  pdf_format: string;

  /********************************************
   * ЗАДАЧА: Определить формат PDF
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ЗАДАЧА: Определить формат PDF",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ЗАДАЧА: Определить формат PDF",
  })
  task_pdf_format: boolean;

  /********************************************
   * ОШИБКА: Определить формат PDF
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ОШИБКА: Определить формат PDF",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ОШИБКА: Определить формат PDF",
  })
  fail_pdf_format: boolean;

  /********************************************
   * Признак: сжатие файла
   ********************************************/
  @Column({
    nullable: false,
    comment: "Признак: сжатие файла",
  })
  @Field(() => Boolean, {
    nullable: false,
    description: "Признак: сжатие файла",
  })
  compress: boolean;

  /********************************************
   * Подписи файла
   ********************************************/
  @OneToMany(() => SignEntity, (sign) => sign.FileItem, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [SignEntity], {
    nullable: true,
    description: "Подписи файла",
  })
  Sign: Promise<SignEntity[]>;

  /********************************************
   * Признак: нахождение файла в деле
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "Признак: нахождение файла в деле",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Признак: нахождение файла в деле",
  })
  is_doc_package: boolean;
}
