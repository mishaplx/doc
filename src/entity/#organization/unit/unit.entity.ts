import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Field, Int, ObjectType } from "@nestjs/graphql";
import { DocEntity } from "../doc/doc.entity";

@ObjectType({ description: "Подразделения" })
@Entity({ name: "unit", schema: "sad" })
@Check(`"parent_id" <> "id"`)
export class UnitEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    nullable: true,
  })
  id: number;

  @Column({ nullable: false, comment: "Полное наименование" })
  @Field({ nullable: false, description: "Полное наименование" })
  nm: string;

  @Column({ nullable: true, comment: "Сокращенное наименование" })
  @Field({ nullable: true, description: "Сокращенное наименование" })
  short_name: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field({ nullable: true, description: "дата создания" })
  dtc: Date;

  @Column({ nullable: false, default: false, comment: "Признак: удалено" })
  del: boolean;

  @Column({ nullable: true, default: false, comment: "Признак: временная запись" })
  temp: boolean;

  //не нашёл где используется, возможно понадобися в будущем для привязки организации и подразделение
  @Column({ nullable: true })
  @Field({ nullable: true })
  org: boolean;

  @Column({
    nullable: true,
    comment: "Вышестоящее подразделение",
  })
  @Field({
    nullable: true,
    description: "Вышестоящее подразделение",
    defaultValue: null,
  })
  parent_id: number;

  @ManyToOne(() => UnitEntity, (unit) => unit.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "parent_id",
    foreignKeyConstraintName: "unit_fk",
  })
  @Field(() => UnitEntity, {
    nullable: true,
    description: "Вышестоящее подразделение: объект",
  })
  ParentUnit: Promise<UnitEntity | null>;

  @Column({ nullable: true })
  @Field({ nullable: true })
  db: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  de: Date;

  @Column({ nullable: true, comment: "Код подразделения" })
  @Field(() => String, { nullable: true, description: "Код подразделения" })
  code: string;

  /********************************************
   * RLS доступ по group_id
   ********************************************/
  @OneToMany(() => DocEntity, (item) => item.Unit, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [DocEntity], {
    nullable: true,
    description: "Список документов, инициатором которых является подразделение",
  })
  Docs: Promise<DocEntity[]>;
}
