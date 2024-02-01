import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ExecJobEntity } from "../job/jobExec.entity";

@ObjectType({ description: "Причины отказа по поручению" })
@Entity({ name: "report_executor", schema: "sad" })
export class ReportExecutorEntity extends BaseEntity {
  @CreateDateColumn({ comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Дата создания",
  })
  dtc: Date;

  @ManyToOne(() => ExecJobEntity, (execJob) => execJob.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "exec_job_id",
    foreignKeyConstraintName: "exec_job_id_fk",
  })
  @Field(() => ExecJobEntity, {
    nullable: false,
    description: "ссылка на исполнителя поручения",
  })
  Exec_job: Promise<ExecJobEntity>;

  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true, comment: "флаг итоговый отчёт или промежуточный" })
  @Field({
    nullable: true,
    description: "флаг итоговый='true' отчёт или промежуточный='false'",
  })
  is_final: boolean;

  @Column({ nullable: true, comment: "текст отчёта", length: 300 })
  @Field({ nullable: true, description: "текст отчёта" })
  note: string;

  Exec_job_id: ExecJobEntity;

  @Column({ comment: "id исполнителя поручения" })
  @Field(() => Int)
  exec_job_id: number;
}
