import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobEntity } from "../job/job.entity";

@ObjectType({ description: "Причины отказа по поручению" })
@Entity({ name: "reject_comment", schema: "sad" })
export class RejectCommentEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, comment: "комментарий" })
  @Field({ nullable: true, description: "комментарий" })
  comment: string;

  @Column({ comment: "Поручение" })
  @Field(() => Int, { description: "Id поручения" })
  job_id: number;

  @ManyToOne(() => JobEntity, (job) => job.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "job_id", foreignKeyConstraintName: "job_id_fk" })
  @Field(() => JobEntity, { description: 'Сущность "Поручение"' })
  Job: Promise<JobEntity>;
}
