import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

import { EmpEntity } from "../emp/emp.entity";
import { NotifyEntity } from "./notify.entity";
import { NotifyTypeGroupEntity } from "./notifyTypeGroup.entity";

@ObjectType({ description: "Уведомления: типы" })
@Entity({ name: "notify_type", schema: "sad" })
@Unique(["notify_type_group_id", "name"])
export class NotifyTypeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: "id записи",
  })
  id: number;

  /********************************************
   * Группа типа сообщения: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Группа типа сообщения: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Группа типа сообщения: id",
  })
  notify_type_group_id: number;

  /********************************************
   * Группа типа сообщения: объект
   ********************************************/
  @ManyToOne(() => NotifyTypeGroupEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "notify_type_group_id",
    foreignKeyConstraintName: "notify_type_group_notify_fk",
  })
  @Field(() => NotifyTypeGroupEntity, {
    nullable: false,
    description: "Группа типа сообщения: объект",
  })
  NotifyTypeGroup: Promise<NotifyTypeGroupEntity>;

  /********************************************
   * Наименование
   ********************************************/
  @Column({
    nullable: false,
    comment: "Наименование",
  })
  @Field(() => String, {
    nullable: false,
    description: "Наименование",
  })
  @MaxLength(32)
  name: string;

  /********************************************
   * Подписка - назначения: объекты
   ********************************************/
  @ManyToMany(() => EmpEntity, {
    // lazy: true,
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "notify_type_emp",
    joinColumn: { name: "notify_type_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "emp_id", referencedColumnName: "id" },
  })
  @Field(() => [EmpEntity], {
    description: "Подписка - назначения: объекты",
  })
  Emps: Promise<EmpEntity[]>;

  // Подписку делать со стороны Emp
  // /********************************************
  //  * Подписка - назначения: ids
  //  ********************************************/
  //   @RelationId("Emps")
  //   @Field(() => [Int], {
  //     description: "Подписка - назначения: ids",
  //   })
  //   emp_ids: number[];

  /********************************************
   * Сообщения по поручению
   ********************************************/
  @OneToMany(() => NotifyEntity, (item) => item.NotifyType, {
    nullable: false,
    cascade: true,
  })
  @Field(() => [NotifyEntity], {
    nullable: false,
    description: "Сообщения",
  })
  Notifies: Promise<NotifyEntity[]>;
}
