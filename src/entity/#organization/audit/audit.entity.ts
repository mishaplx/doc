import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { DocEntity } from "../doc/doc.entity";
import { StaffEntity } from "../staff/staff.entity";
import { UserEntity } from "../user/user.entity";

@ObjectType({ description: "Аудит" })
@Entity({ name: "audit", schema: "sad" })
export class AuditEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /** ID пользователя */
  @Column({ nullable: true, comment: "ID пользователя" })
  @Field(() => Int, { nullable: true, description: "ID пользователя" })
  user_id: number;

  /** Тип сообщения */
  @Column({ nullable: true, type: "text", comment: "Тип сообщения", default: "Успешная операция" })
  @Field({ nullable: true, description: "Тип сообщения" })
  type: string;

  @ManyToOne(() => UserEntity, (users) => users.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id", foreignKeyConstraintName: "users_FK" })
  @Field(() => UserEntity, {
    nullable: true,
    description: "Пользователь",
  })
  User: Promise<UserEntity>;

  /** ID staff */
  @Column({ nullable: true, comment: "ID staff" })
  @Field(() => Int, { nullable: true, description: "ID staff" })
  staff_id: number;

  @ManyToOne(() => StaffEntity, (staff) => staff.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "staff_id", foreignKeyConstraintName: "staff_FK" })
  @Field(() => StaffEntity, {
    nullable: true,
    description: "Staff",
  })
  Staff: Promise<StaffEntity>;

  /** Имя пользователя */
  @Column({ nullable: true, type: "text", comment: "Имя пользователя" })
  @Field({ nullable: true, description: "Имя пользователя" })
  username: string;

  /** Событие */
  @Column({ nullable: true, type: "text", comment: "Событие" })
  @Field({ nullable: true, description: "Событие" })
  event: string;

  /** Описание */
  @Column({ nullable: true, type: "text", comment: "Описание" })
  @Field({ nullable: true, description: "Описание" })
  description: string;

  /** Дата создания */
  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  /** Содержание запроса */
  @Column({ nullable: true, type: "json", comment: "Содержание запроса" })
  @Field(() => JSON, { nullable: true, description: "Содержание запроса" })
  request: any;

  /** Содержание ответа */
  @Column({ nullable: true, type: "json", comment: "Содержание ответа" })
  @Field(() => JSON, { nullable: true, description: "Содержание ответа" })
  response: any;

  /** Адрес запроса */
  @Column({ nullable: true, type: "text", comment: "Адрес запроса" })
  @Field({ nullable: true, description: "Адрес запроса" })
  url: string;

  /** Метод запроса */
  @Column({ nullable: true, type: "text", comment: "Метод запроса" })
  @Field({ nullable: true, description: "Метод запроса" })
  method: string;

  /** Хэш */
  @Column({ nullable: true, type: "text", comment: "Хэш" })
  @Field({ nullable: true, description: "Хэш" })
  hash: string;

  /** IP пользователя */
  @Column({ nullable: true, type: "text", comment: "IP пользователя" })
  @Field({ nullable: true, description: "IP пользователя" })
  ip: string;

  /** ID Документа */
  @Column({ nullable: true, comment: "ID Документа" })
  @Field(() => Int, { nullable: true, description: "ID Документа" })
  doc_id: number;

  @ManyToOne(() => DocEntity, (doc) => doc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "doc_id", foreignKeyConstraintName: "doc_FK" })
  @Field(() => DocEntity, {
    nullable: true,
    description: "Пользователь",
  })
  Doc: Promise<DocEntity>;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата последней записи",
  })
  dtc_end_point: Date;
}
