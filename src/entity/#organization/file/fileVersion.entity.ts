import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FILE } from "../../../modules/file/file.const";
import { EmpEntity } from "../emp/emp.entity";
import { FileBlockEntity } from "./fileBlock.entity";
import { FileItemEntity } from "./fileItem.entity";

@ObjectType({ description: "Версии файлов" })
@Entity({ name: "file_version", schema: "sad" })
export class FileVersionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Файловый блок: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Файловый блок",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Файловый блок",
  })
  file_block_id: number;

  /********************************************
   * Файловый блок: объект
   ********************************************/
  @ManyToOne(() => FileBlockEntity, (file_block) => file_block.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "file_block_id",
    foreignKeyConstraintName: "fileblock_fileversion_fk",
  })
  @Field(() => FileBlockEntity, {
    nullable: false,
    description: "Файловый блок",
  })
  FileBlock: Promise<FileBlockEntity>;

  /********************************************
   * Версия файла: номер
   ********************************************/
  @Column({
    nullable: false,
    default: 1,
    comment: "Версия файла: номер",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 1,
    description: "Версия файла: номер",
  })
  version: number;

  /********************************************
   * Название файла (без расширения)
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Название файла (без расширения)",
  })
  @Field(() => String, {
    nullable: false,
    description: "Название файла (без расширения)",
  })
  name: string;

  /********************************************
   * Текстовое содержание файла
   ********************************************/
  @Column({
    nullable: true,
    type: "text",
    comment: "Текстовое содержание файла",
  })
  @Field(() => String, {
    nullable: true,
    description: "Текстовое содержание файла",
  })
  // @Index({ fulltext: true }) ошибка в больших текстах
  content: string;

  /********************************************
   * ЗАДАЧА: Получить текстовое содержание главного файла
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ЗАДАЧА: Получить текстовое содержание главного файла",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ЗАДАЧА: Получить текстовое содержание главного файла",
  })
  task_main_content: boolean;

  /********************************************
   * ОШИБКА: Получить текстовое содержание главного файла
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ОШИБКА: Получить текстовое содержание главного файла",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ОШИБКА: Получить текстовое содержание главного файла",
  })
  fail_main_content: boolean;

  /********************************************
   * ЗАДАЧА: Создать PDF-копию
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ЗАДАЧА: Создать PDF-копию",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ЗАДАЧА: Создать PDF-копию",
  })
  task_pdf_create: boolean;

  /********************************************
   * ОШИБКА: Создать PDF-копию
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment: "ОШИБКА: Создать PDF-копию",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "ОШИБКА: Создать PDF-копию",
  })
  fail_pdf_create: boolean;

  /********************************************
   * Признак: хранить только pdf
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment:
      "Признак: хранить только pdf (после создания pdf уничтожить главный файл, сделав pdf главным)",
  })
  @Field(() => String, {
    nullable: false,
    // defaultValue: false,
    description:
      "Признак: хранить только pdf (после создания pdf уничтожить главный файл, сделав pdf главным)",
  })
  pdf_only: boolean;

  /********************************************
   * Признак: уведомлять о завершении выполнения
   * всех отложенных операций над зависимым файлом
   * (конверация, проверка типа и т.п.)
   ********************************************/
  @Column({
    nullable: false,
    default: false,
    comment:
      "Признак: уведомлять о завершении выполнения всех отложенных операций над зависимым файлом (конверация, проверка типа и т.п.)",
  })
  @Field(() => String, {
    nullable: false,
    // defaultValue: false,
    description:
      "Признак: уведомлять о завершении выполнения всех отложенных операций над зависимым файлом (конверация, проверка типа и т.п.)",
  })
  notify_complete_depend: boolean;

  /********************************************
   * Файлы: ids
   * (заполнение @AfterLoad)
   ********************************************/
  @Field(() => [Int], {
    description: "Файлы: ids",
  })
  file_items: number[];

  /********************************************
   * Файлы: объекты
   ********************************************/
  @OneToMany(() => FileItemEntity, (sign) => sign.FileVersion, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileItemEntity], {
    nullable: true,
    description: "Файлы: объекты",
  })
  FileItems: Promise<FileItemEntity[]>;

  /********************************************
   * Файл главный (объект): у которого установлен признак main
   * (заполнение @AfterLoad)
   ********************************************/
  @Field(() => FileItemEntity, {
    nullable: true,
    description: "Файл главный (объект): у которого установлен признак main",
  })
  FileItemMain: FileItemEntity;

  /********************************************
   * Файл зависимый (объект): у которого не установлен признак main
   * (заполнение @AfterLoad)
   ********************************************/
  @Field(() => FileItemEntity, {
    nullable: true,
    description: "Файл зависимый (объект): у которого не установлен признак main",
  })
  FileItemDepend: FileItemEntity;

  /********************************************
   * Файлы pdf (объекты): с расширением pdf
   * (заполнение @AfterLoad)
   ********************************************/
  @Field(() => [FileItemEntity], {
    nullable: true,
    description: "Файлы pdf (объекты): с расширением pdf",
  })
  FileItemsPDF: FileItemEntity[];

  /********************************************
   * Файл архивный (объект): pdf_format из списка FILE.FORMAT.ARJ
   * (заполнение @AfterLoad)
   ********************************************/
  @Field(() => FileItemEntity, {
    nullable: true,
    description: "Файл архивный (объект): pdf_format из списка FILE.FORMAT.ARJ",
  })
  FileItemArj: FileItemEntity;

  /********************************************
   * Примечание
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    default: "",
    comment: "Примечание",
  })
  @Field(() => String, {
    nullable: false,
    defaultValue: "",
    description: "Примечание",
  })
  note: string;

  /********************************************
   * Автор: id
   ********************************************/
  @Index()
  @Column({
    nullable: true,
    comment: "Автор: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Автор: id",
  })
  emp_id: number;

  /********************************************
   * Автор: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "emp_fileversion_fk",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Автор: объект",
  })
  Emp: Promise<EmpEntity>;

  /********************************************
   * ПОСЛЕ ЗАГРУЗКИ: УСТАНОВИТЬ ВЫЧИСЛЯЕМЫЕ ПОЛЯ
   ********************************************/
  @AfterLoad()
  async setComputedFields(): Promise<void> {
    const Items = (await this.FileItems) ?? [];
    Items.sort((a, b) => a.date_create.getTime() - b.date_create.getTime());

    // файлы: ids
    this.file_items = Items.map((item) => item.id);

    // файл главный (объект): у которого установлен признак main
    this.FileItemMain = Items.find((item) => item.main === true);

    // файл зависимый (объект): у которого не установлен признак main
    this.FileItemDepend = Items.find((item) => item.main !== true);

    // файлы pdf (объекты): с расширением pdf
    this.FileItemsPDF = Items.filter((item) => item.ext.toLowerCase() == "pdf");

    // файл архивный (объект): pdf_format из списка FILE.FORMAT.ARJ
    this.FileItemArj = Items.find((item) =>
      (FILE.FORMAT.ARJ as string[]).includes(item.pdf_format),
    );
  }
}
