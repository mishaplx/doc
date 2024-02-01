import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Admin_abonentsEntity } from "../admin_abonents/admin_abonents.entity";
@ObjectType()
@Entity({ name: "admin_org", schema: "sad" })
@Unique(["name"])
export class Admin_orgEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: "varchar", length: 255, comment: "Название базы данных" })
  @MaxLength(200)
  @Field({ nullable: true })
  name: string;

  @Column({ type: "varchar", length: 255, comment: "Название организации" })
  @Field({ nullable: true })
  @MaxLength(200)
  organization: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", comment: "Дата создания" })
  @Field({ nullable: true })
  date_create: Date;

  @Column({ type: "timestamp", nullable: true, comment: "Дата деактивации" })
  @Field({ nullable: true })
  date_deactivate: Date | null;

  @Column({ type: "timestamp", nullable: true, comment: "Дата активации" })
  @Field({ nullable: false })
  date_activated: Date;

  @Column({ type: "boolean", comment: "Признак активации" })
  @Field({ nullable: true, description: "Признак активации" })
  is_activate: boolean;

  @Column({ type: "boolean", comment: "Признак системной базы данных" })
  is_sys: boolean;

  @Column({ type: "text", nullable: true, comment: "Описание базы данных" })
  @Field({ nullable: true, description: ' "Описание базы данных"' })
  description: string;

  @Column({ type: "integer", nullable: true, comment: "Количество пользователей" })
  @Field({ nullable: true, description: "Количество пользователей" })
  count_user: number;

  @OneToMany(() => Admin_abonentsEntity, (adminAbonent) => adminAbonent.AdminOrg, {
    nullable: true,
    // onDelete: "CASCADE", TODO нужно ?
  })
  @Field(() => [Admin_abonentsEntity], { nullable: true })
  Abonents: Promise<Admin_abonentsEntity[]>;
}
