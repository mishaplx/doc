import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmpEntity } from "../emp/emp.entity";

@ObjectType({ description: "Тип контроля поручения" })
@Entity({ name: "jobs_control_types", schema: "sad" })
export class JobsControlTypesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;
  @Column({ nullable: true, default: false, type: "boolean" })
  del: boolean;
  @Column({ nullable: true, default: false, type: "boolean" })
  temp: boolean;

  @Column({ comment: "Наименование типа контроля поручения", type: "text" })
  @Field({ description: "Наименование типа контроля поручения" })
  nm: string;

  @Column({ nullable: true, comment: "Контролер" })
  @Field(() => Int, { nullable: true, description: "Id контролера" })
  controller_id: number;

  @Column({ nullable: true, comment: "Наименование контролера", type: "text" })
  @Field({ description: "Наименование контролера" })
  controller: string;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "controller_id",
    foreignKeyConstraintName: "controller_id_FL",
  })
  @Field(() => EmpEntity, { nullable: true, description: "Контролер" })
  Controller: Promise<EmpEntity>;
}
