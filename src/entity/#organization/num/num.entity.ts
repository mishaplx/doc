import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { KdocEntity } from "../doc/kdoc.entity";
import { TdocEntity } from "../doc/tdoc.entity";
import { UnitEntity } from "../unit/unit.entity";
import { NumParamSelEntity } from "./numParamSel.entity";

@ObjectType({ description: "Нумератор" })
@Entity({ name: "num", schema: "sad" })
// @Unique(['num_temp_id','tdoc_id','kdoc_id']) // несколько одинаковых записей нельзя
export class NumEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /********************************************
   * Наименование нумератора
   ********************************************/
  @Column({
    nullable: false,
    comment: "Наименование нумератора",
  })
  @Field(() => String, {
    nullable: false,
    description: "Наименование нумератора",
  })
  name: string;

  /********************************************
   * Тип документа: объект
   ********************************************/
  @ManyToOne(() => KdocEntity, (kdoc) => kdoc.id, {
    lazy: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "kdoc_id",
    foreignKeyConstraintName: "num_kdoc_fk",
  })
  @Field(() => KdocEntity, {
    nullable: false,
    description: "Тип документа: объект",
  })
  Kdoc: Promise<KdocEntity>;

  /********************************************
   * Тип документа: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Тип документа: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Тип документа: id",
  })
  kdoc_id: number;

  /********************************************
   * Виды документа: объекты
   ********************************************/
  @ManyToMany(() => TdocEntity, {
    lazy: true,
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "num_tdoc",
    joinColumn: { name: "num_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tdoc_id", referencedColumnName: "id" },
  })
  @Field(() => [TdocEntity], {
    description: "Виды документа: объекты",
  })
  Tdocs: TdocEntity[];

  /********************************************
   * Виды документа: ids
   ********************************************/
  @RelationId("Tdocs")
  @Field(() => [Int], {
    description: "Виды документа: ids",
  })
  tdoc_ids: number[];

  /********************************************
   * Подразделения: объекты
   ********************************************/
  @ManyToMany(() => UnitEntity, {
    lazy: true,
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "num_unit",
    joinColumn: { name: "num_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "unit_id", referencedColumnName: "id" },
  })
  @Field(() => [UnitEntity], {
    description: "Подразделения: объекты",
  })
  Units: UnitEntity[];

  /********************************************
   * Подразделения: ids
   ********************************************/
  @RelationId("Units")
  @Field(() => [Int], {
    description: "Подразделения: ids",
  })
  unit_ids: number[];

  /********************************************
   * Выбранные параметры (связи): объекты
   ********************************************/
  @OneToMany(() => NumParamSelEntity, (numParamSel) => numParamSel.Num, {
    lazy: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "num_param_sel_ids",
    foreignKeyConstraintName: "num_param_sel_num_fk",
  })
  @Field(() => [NumParamSelEntity], {
    description: "Выбранные параметры (связи): объекты",
  })
  NumParamSel: Promise<NumParamSelEntity[]>;

  // Сортируем параметры связи по возрастанию
  @AfterLoad()
  async setComputed(): Promise<void> {
    (await this.NumParamSel).sort((a, b) => a.id - b.id);
  }

  /********************************************
   * Счетчик: текущее значение
   ********************************************/
  @Column({
    nullable: false,
    default: 0,
    comment: "Счетчик: текущее значение",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 0,
    description: "Счетчик: текущее значение",
  })
  count_val: number;

  /********************************************
   * Счетчик: дата последнего обращения
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Счетчик: дата последнего обращения",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Счетчик: дата последнего обращения",
  })
  count_tick: Date;

  /********************************************
   * Счетчик: признак ежегодного сброса
   ********************************************/
  @Column({
    nullable: false,
    default: true,
    comment: "Счетчик: признак ежегодного сброса",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: true,
    description: "Счетчик: признак ежегодного сброса",
  })
  count_reset_year: boolean;

  /********************************************
   * Дата начала действия
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата начала действия",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    defaultValue: new Date(),
    description: "Дата начала действия",
  })
  date_start: Date;

  /********************************************
   * Дата завершения действия
   ********************************************/
  @Column({
    type: "timestamp",
    nullable: true,
    comment: "Дата завершения действия",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата завершения действия",
  })
  date_end: Date;

  /********************************************
   * Примечание
   ********************************************/
  @Column({
    nullable: true,
    comment: "Примечание",
  })
  @Field(() => String, {
    nullable: true,
    description: "Примечание",
  })
  note: string;
}
