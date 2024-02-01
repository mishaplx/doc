import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { RlsAccessGroupEntity } from "./rls.access.group.entity";

@ObjectType({ description: "RLS группы" })
@Entity({ name: "rls_group", schema: "sad" })
@Unique(["name"])
export class RlsGroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Название
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    comment: "Название",
  })
  @Field(() => String, {
    nullable: false,
    description: "Название",
  })
  name: string;

  /********************************************
   * RLS доступ по group_id
   ********************************************/
  @OneToMany(() => RlsAccessGroupEntity, (item) => item.RlsGroup, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessGroupEntity], {
    nullable: true,
    description: "RLS доступ по group_id",
  })
  RlsAccessGroup: Promise<RlsAccessGroupEntity[]>;

  /********************************************
   * Назначения: объекты
   ********************************************/
  @ManyToMany(() => EmpEntity, {
    lazy: true,
    cascade: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({
    name: "rls_group_emp",
    joinColumn: { name: "rls_group_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "emp_id", referencedColumnName: "id" },
  })
  @Field(() => [EmpEntity], {
    description: "Назначения: объекты",
  })
  Emps: EmpEntity[]; // Promise нельзя т.к. проболемы при обновлении

  /********************************************
   * Назначения: ids
   ********************************************/
  @RelationId("Emps")
  @Field(() => [Int], {
    description: "Назначения: ids",
  })
  emp_ids: number[];

  /********************************************
   * Примечание
   ********************************************/
  @Column({
    nullable: false,
    type: "text",
    default: "",
    comment: "Примечание",
  })
  @Field(() => String, {
    nullable: false,
    defaultValue: "",
    description: "Примечание",
  })
  note: string;
}
