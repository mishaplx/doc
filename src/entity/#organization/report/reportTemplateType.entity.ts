import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { ReportTemplateEntity } from "./reportTemplate.entity";

@ObjectType({ description: "Отчеты: типы шаблонов" })
@Entity({ name: "report_template_type", schema: "sad" })
export class ReportTemplateTypeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Название типа шаблона отчета
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Название типа шаблона отчета",
  })
  @Field(() => String, {
    nullable: false,
    description: "Название типа шаблона отчета",
  })
  name: string;

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
   * Шаблоны отчетов
   ********************************************/
  @OneToMany(() => ReportTemplateEntity, (item) => item.ReportTemplateType, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [ReportTemplateEntity], {
    nullable: true,
    description: "Шаблоны отчетов",
  })
  Reports: Promise<ReportTemplateEntity[]>;
}
