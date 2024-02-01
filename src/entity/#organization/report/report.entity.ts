import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { EmpEntity } from "../emp/emp.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";
import { ReportTemplateEntity } from "./reportTemplate.entity";

@ObjectType({ description: "Отчеты" })
@Entity({ name: "report", schema: "sad" })
export class ReportEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Параметры, с которыми отчет был сформирован
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    default: "",
    comment: "Параметры, с которыми отчет был сформирован",
  })
  @Field(() => String, {
    nullable: false,
    defaultValue: "",
    description: "Параметры, с которыми отчет был сформирован",
  })
  param: string;

  /********************************************
   * Дата создания отчета
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания файла",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    defaultValue: new Date(),
    description: "Дата создания отчета",
  })
  date_create: Date;

  /********************************************
   * Создатель: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Создатель: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Создатель: id",
  })
  emp_id: number;

  /********************************************
   * Создатель: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "report_emp_fk",
  })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "Создатель: объект",
  })
  Emp: Promise<EmpEntity>;

  /********************************************
   * Шаблон: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Шаблон: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Шаблон: id",
  })
  report_template_id: number;

  /********************************************
   * Шаблон: объект
   ********************************************/
  @ManyToOne(() => ReportTemplateEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "report_template_id",
    foreignKeyConstraintName: "report_fileblock_fk",
  })
  @Field(() => ReportTemplateEntity, {
    nullable: false,
    description: "Шаблон: объект",
  })
  ReportTemplate: Promise<ReportTemplateEntity>;

  /********************************************
   * Файл отчета (файловый блок)
   ********************************************/
  @OneToOne(() => FileBlockEntity, (item) => item.Report, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @Field(() => FileBlockEntity, {
    nullable: true,
    description: "Файл отчета (файловый блок)",
  })
  FileBlock: Promise<FileBlockEntity>;

  // /********************************************
  //  * Сообщения по отчету
  //  * ОТКЛЮЧЕНО ТК ОДИН ОТЧЕТ ДЛЯ ШАБЛОНА И НЕТ СМЫСЛА
  //  ********************************************/
  // @OneToMany(() => NotifyEntity, (item) => item.Report, {
  //   nullable: true,
  //   cascade: true,
  // })
  // @Field(() => [NotifyEntity], {
  //   nullable: true,
  //   description: "Сообщения по отчету",
  // })
  // Notify: Promise<NotifyEntity[]>;
}
