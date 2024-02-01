import { Field, Int, ObjectType } from "@nestjs/graphql";
import { MaxLength } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { NotifyTypeEntity } from "./notifyType.entity";

@ObjectType({ description: "Уведомления: группы типов" })
@Entity({ name: "notify_type_group", schema: "sad" })
@Unique(["name"])
export class NotifyTypeGroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: "id записи",
  })
  id: number;

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
  @MaxLength(64)
  name: string;

  /********************************************
   * Типы сообщений группы
   ********************************************/
  @OneToMany(() => NotifyTypeEntity, (item) => item.NotifyTypeGroup, {
    nullable: false,
    cascade: true,
  })
  @Field(() => [NotifyTypeEntity], {
    nullable: false,
    description: "Типы сообщений группы",
  })
  NotifyTypes: Promise<NotifyTypeEntity[]>;
}
