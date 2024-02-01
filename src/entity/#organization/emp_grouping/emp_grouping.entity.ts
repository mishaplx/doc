import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { GroupingEntity } from "../grouping/grouping.entity";

@ObjectType()
@Entity({ name: "emp_grouping", schema: "sad" })
export class EmpGroupingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "emp_id", foreignKeyConstraintName: "emp_id_FK" })
  @Field(() => EmpEntity, { nullable: false })
  Emp: Promise<EmpEntity>;

  @Column({ nullable: false, comment: "ссылка на group" })
  @Field(() => Int, { description: "ссылка на group" })
  emp_id: number;

  @ManyToOne(() => GroupingEntity, (group) => group.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "grouping_id",
    foreignKeyConstraintName: "grouping_id_FK",
  })
  @Field(() => GroupingEntity, { nullable: false })
  Grouping: Promise<GroupingEntity>;

  @Column({ nullable: false, comment: "ссылка на group" })
  @Field(() => Int, { nullable: false })
  grouping_id: number;
}
