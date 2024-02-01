import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

import { EmpGroupingEntity } from "../emp_grouping/emp_grouping.entity";

@ObjectType()
@Unique(["nm"])
@Entity({ name: "grouping", schema: "sad" })
export class GroupingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false, comment: "флаг удаления" })
  @Field({ nullable: true })
  del: boolean;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  temp: boolean;

  @Column({ nullable: true, comment: "название группы" })
  @Field({ nullable: true })
  nm: string;

  @Column({ nullable: true, comment: "Подразделения" })
  @Field({ nullable: true })
  units: string;

  /** Пользователи */
  @Column({ nullable: true, type: "json", comment: "Users" })
  @Field(() => JSON, { nullable: true, description: "Пользователи" })
  Users: any;

  @OneToMany(() => EmpGroupingEntity, (empGroup) => empGroup.Grouping, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @Field(() => [EmpGroupingEntity], {
    nullable: true,
    description: "Входящие в группу люди",
  })
  EmpGroup: Promise<EmpGroupingEntity[]>;
}
