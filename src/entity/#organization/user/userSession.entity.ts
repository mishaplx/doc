import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserEntity } from "./user.entity";
import { UserSessionTypeEnum } from "../../../auth/session/auth.session.const";
import { FileBlockEntity } from "../file/fileBlock.entity";

@ObjectType({ description: "Сессии пользователя" })
@Entity({ name: "users_session", schema: "sad" })
export class UserSessionEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Пользователь: id
   ********************************************/
  @Index()
  @Column({
    comment: "Пользователь: id",
    nullable: false,
  })
  @Field(() => Int, {
    description: "Пользователь: id",
    nullable: false,
  })
  user_id: number;

  /********************************************
   * Пользователь: объект
   ********************************************/
  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "user_id",
    foreignKeyConstraintName: "user_session_fk",
  })
  @Field(() => UserEntity, {
    nullable: false,
    description: "Пользователь: объект",
  })
  User: Promise<UserEntity>;

  /********************************************
   * Тип сессии
   ********************************************/
  @Column({
    type: "enum",
    enum: UserSessionTypeEnum,
    nullable: false,
    default: UserSessionTypeEnum.person,
    comment: "Тип сессии",
  })
  @Field(() => UserSessionTypeEnum, {
    nullable: false,
    defaultValue: UserSessionTypeEnum.person,
    description: "Тип сессии",
  })
  type_session: UserSessionTypeEnum;

  /********************************************
   * Сессионный токен
   * (явная необходимость в хранении отсутствует)
   ********************************************/
  @Column({
    nullable: false,
    comment: "Сессионный токен",
    default: "",
  })
  @Field({
    nullable: false,
    description: "Сессионный токен",
    defaultValue: "",
  })
  refresh_token: string;

  /********************************************
   * Дата создания сессии
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания сессии",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания сессии",
  })
  date_create: Date;

  /********************************************
   * Дата последней активности
   ********************************************/
  @CreateDateColumn({
    type: "timestamp",
    nullable: false,
    comment: "Дата последней активности",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата последней активности",
  })
  date_activity: Date;

  /********************************************
   * Дата завершения сессии
   ********************************************/
  @Column({
    nullable: true,
    comment: "Дата завершения сессии",
  })
  @Field({
    nullable: true,
    description: "Дата завершения сессии",
  })
  date_expiration: Date;

  /********************************************
   * Заблокированные сессией файловые блоки
   ********************************************/
  @OneToMany(() => FileBlockEntity, (item) => item.BlockUserSession, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileBlockEntity], {
    nullable: true,
    description: "Заблокированные сессией файловые блоки",
  })
  BlockFileItem: Promise<FileBlockEntity[]>;

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
