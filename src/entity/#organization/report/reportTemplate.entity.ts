import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { ReportEntity } from "./report.entity";
import { ReportTemplateTypeEntity } from "./reportTemplateType.entity";

@ObjectType({ description: "Отчеты: шаблоны" })
@Entity({ name: "report_template", schema: "sad" })
export class ReportTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Тип шаблона отчета: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Тип шаблона отчета: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Тип шаблона отчета: id",
  })
  report_template_type_id: number;

  /********************************************
   * Тип шаблона отчета: объект
   ********************************************/
  @ManyToOne(() => ReportTemplateTypeEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "report_template_type_id",
    foreignKeyConstraintName: "reporttemplate_reporttemplatetype_fk",
  })
  @Field(() => ReportTemplateTypeEntity, {
    nullable: false,
    description: "Тип шаблона отчета: объект",
  })
  ReportTemplateType: Promise<ReportTemplateTypeEntity>;

  /********************************************
   * Название шаблона отчета
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Название шаблона отчета",
  })
  @Field(() => String, {
    nullable: false,
    description: "Название шаблона отчета",
  })
  name: string;

  /********************************************
   * Путь к папке с шаблоном
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Путь к папке с шаблоном",
  })
  @Field(() => String, {
    nullable: false,
    description: "Путь к папке с шаблоном",
  })
  path: string;

  /********************************************
   * Флаг удаления
   ********************************************/
  @Column({
    nullable: false,
    type: "boolean",
    comment: "Флаг удаления",
    default: false,
  })
  del: boolean;

  /********************************************
   * Описание
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    default: "",
    comment: "Описание",
  })
  @Field({
    nullable: false,
    defaultValue: "",
    description: "Описание",
  })
  description: string;

  /********************************************
   * Готовые отчеты
   ********************************************/
  @OneToMany(() => ReportEntity, (item) => item.ReportTemplate, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [ReportEntity], {
    nullable: true,
    description: "Готовые отчеты",
  })
  Reports: Promise<ReportEntity[]>;
}
