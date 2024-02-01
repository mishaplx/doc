import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobEntity } from "./job.entity";
import { ExecJobEntity } from "./jobExec.entity";

@ObjectType({ description: "История продления срока" })
@Entity({ name: "job_prolong_requests", schema: "sad" })
export class JobProlongRequestEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /********************************************
   * Дата запроса
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Дата запроса",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата запроса",
  })
  date_prolong_request: Date;

  /********************************************
   * Дата (продлить до)
   ********************************************/
  @Column({
    nullable: false,
    comment: "Дата (продлить до)",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата (продлить до)",
  })
  date_prolong_end: Date;

  /********************************************
   * Дата решения по запросу
   ********************************************/
  @Column({
    nullable: true,
    comment: "Дата решения по запросу",
  })
  @Field({
    nullable: true,
    description: "Дата решения по запросу",
  })
  date_prolong_resolv: Date;

  /********************************************
   * Признак продления срока
   ********************************************/
  @Column({
    nullable: true,
    comment: "Признак продления срока",
  })
  @Field(() => Boolean, {
    nullable: true,
    description: "Признак продления срока",
  })
  approved: boolean;

  @Column({ nullable: true, comment: "Комментарий к запросу" })
  @Field({ nullable: true, description: "Комментарий к запросу" })
  prolong_note: string;

  /********************************************
   * Поручение
   ********************************************/
  @Column({
    nullable: false,
    comment: "Поручение: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Поручение: id",
  })
  job_id: number;

  @ManyToOne(() => JobEntity, (Job) => Job.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "prolong_job_FK",
  })
  @Field(() => JobEntity, {
    nullable: false,
    description: "Поручение: объект",
  })
  Job: Promise<JobEntity>;

  /********************************************
   * Инициатор продления
   ********************************************/
  @Column({
    nullable: false,
    comment: "Инициатор продления: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Инициатор продления: id",
  })
  exec_job_id: number;

  @ManyToOne(() => ExecJobEntity, (execJob) => execJob.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "exec_job_id",
    foreignKeyConstraintName: "prolong_exec_job_FK",
  })
  @Field(() => ExecJobEntity, {
    nullable: false,
    description: "Инициатор продления: объект",
  })
  Exec_job: Promise<ExecJobEntity>;
}
