import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TdocEntity } from "../doc/tdoc.entity";
import { EmpEntity } from "../emp/emp.entity";

@ObjectType({ description: "Очередь СМДО" })
@Entity({ name: "smdo_stack", schema: "sad" })
export class SmdoStackEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /** Тело пакета */
  @Column({ nullable: true, type: "json", comment: "body" })
  @Field(() => JSON, { nullable: true, description: "Тело пакета" })
  body: any;

  /** Признак активности */
  @Column({ nullable: false, type: "boolean", default: true, comment: "is_active" })
  @Field({ nullable: false, defaultValue: true, description: "Признак активности" })
  is_active: boolean;

  /** Последняя дата отправки */
  @Column({ nullable: true, comment: "send_time" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Последняя дата отправки",
  })
  send_time: Date;

  /** Дата создания */
  @Column({ nullable: true, comment: "dtc" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  /** ID сотрудника */
  @Column({ nullable: true, comment: "ID сотрудника" })
  @Field(() => Int, { nullable: true, description: "ID сотрудника" })
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

  @Column({ nullable: true, comment: "Заголовок документа" })
  @Field({ nullable: true, description: "Заголовок документа" })
  title: string;

  @Column({ nullable: true, comment: "Рег. номер документа" })
  @Field({ nullable: true, description: "Рег. номер документа" })
  regNum: string;

  @Column({ nullable: true, comment: "Получатели" })
  @Field({ nullable: true, description: "Получатели" })
  receivers: string;
}
