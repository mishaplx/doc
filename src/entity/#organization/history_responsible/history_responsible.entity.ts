import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { JobEntity } from "../job/job.entity";

@ObjectType({ description: "история изменение свода" })
@Entity({ name: "history_responsible", schema: "sad" })
export class HistoryResponsibleEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /**
   * Поручение: объект
   */
  @Index("idx-job_id")
  @Column({
    nullable: false,
    comment: "Поручение",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Поручение",
  })
  job_id: number;

  @ManyToOne(() => JobEntity, (job) => job.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "job_id", foreignKeyConstraintName: "job_id_FK" })
  @Field(() => JobEntity, {
    nullable: false,
    description: "Поручение: объект",
  })
  Job: Promise<JobEntity>;

  /**
   * Исполнитель: объект
   */
  @Index("idx-emp_id")
  @Column({
    nullable: false,
    comment: "Исполнитель",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Исполнитель",
  })
  emp_id: number;
  @Index("idx-Emp")
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "emp_id", foreignKeyConstraintName: "emp_id_FK" })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "Исполнитель: объект",
  })
  Emp: Promise<EmpEntity>;

  /**
   * Дата установки
   */
  @Column({
    nullable: false,
    comment: "Дата установки",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата установки свод",
  })
  date_start: Date;

  /**
   * Дата снятия
   */
  @Column({
    nullable: true,
    comment: "Дата снятия",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата снятия свод",
  })
  date_end: Date;
}
