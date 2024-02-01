import { Field, ObjectType } from "@nestjs/graphql";
import { MaxLength, MinLength } from "class-validator";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Admin_orgEntity } from "../admin_org/admin_org.entity";

@ObjectType()
@Entity({ name: "abonents", schema: "sad" })
export class Admin_abonentsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: "text" })
  @MaxLength(200)
  @MinLength(5)
  @Field({ description: "Login пользователя", nullable: false })
  username: string;

  @CreateDateColumn()
  @Field({ description: "Дата создания пользователя" })
  dtc: Date;

  @Column({ type: "text", nullable: true })
  @Field({ description: "Название базы данных" })
  org_id: number;

  @ManyToOne(() => Admin_orgEntity, (adminOrg) => adminOrg.Abonents)
  @JoinColumn({ name: "org_id", foreignKeyConstraintName: "FK_org_id" })
  AdminOrg: Admin_orgEntity;
}
