import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { ReportExecutorEntity } from "../report_executior/report_executor.entity";
import { JobEntity } from "./job.entity";
import { JobProlongRequestEntity } from "./jobProlongRequest.entity";

@ObjectType({ description: "Исполнители поручения" })
@Entity({ name: "exec_job", schema: "sad" })
//@Check(`"date_assign" >= current_timestamp`)
export class ExecJobEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  /**
   * ПОРУЧЕНИЕ
   **/
  @Column({
    comment: "Поручение: id",
  })
  @Field(() => Int, {
    description: "Поручение: id",
  })
  job_id: number;

  @ManyToOne(() => JobEntity, (job) => job.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "job_id_FK",
  })
  @Field(() => JobEntity, {
    description: 'Поручение: объект"',
  })
  Job: Promise<JobEntity>;

  /**
   * Флаг: удалено
   */
  @Column({
    nullable: false,
    default: false,
    comment: "Флаг: удалено",
  })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Флаг: удалено",
  })
  del: boolean;

  @Column({ comment: "Исполнитель" })
  @Field(() => Int, { description: "Id исполнителя" })
  emp_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "emp_id", foreignKeyConstraintName: "emp_id_FK" })
  @Field(() => EmpEntity, { description: "Исполнитель" })
  Controller: Promise<EmpEntity>;

  /**
   * Отметка «свод.» обозначает, что данный исполнитель назначен ответственным,
   * он «организует работу соисполнителей и отвечает за качественное
   * и своевременное исполнение поручения».
   */
  @Column({ comment: "Отметка «свод.»", default: false })
  @Field({ description: "Отметка «свод.»" })
  is_responsible: boolean;

  @Column({ nullable: true, comment: "Примечание", type: "text" })
  @Field({ nullable: true, description: "Примечание" })
  note: string;

  @Column({ nullable: true, comment: "Дата направления" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата направления",
  })
  date_assign: Date;

  @Column({ nullable: true, comment: "Дата ознакомления" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата ознакомления",
  })
  date_reading: Date;

  @Column({ nullable: true, comment: "Дата отчета" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата отчета",
  })
  date_end: Date;

  @Column({ nullable: true, comment: "Комментарий к отчету", type: "text" })
  @Field({ nullable: true, description: "Комментарий к отчету" })
  end_note: string;

  /** история продления срока */
  @OneToMany(() => JobProlongRequestEntity, (item) => item.Exec_job, {
    nullable: true,
  })
  @Field(() => [JobProlongRequestEntity], {
    nullable: true,
    description: "история продления срока",
  })
  prolong_request: Promise<JobProlongRequestEntity[]>;

  /** история отчетов исполнителя */
  @OneToMany(() => ReportExecutorEntity, (item) => item.Exec_job, {
    nullable: true,
  })
  @Field(() => [ReportExecutorEntity], {
    nullable: true,
    description: "история отчетов исполнителя",
  })
  Reports: Promise<ReportExecutorEntity[]>;

  /********************************************
   * Последний отчет (заполнение @AfterLoad)
   ********************************************/
  @Field(() => ReportExecutorEntity, {
    nullable: true,
    description: "Последний отчет: объект",
  })
  ReportLast: ReportExecutorEntity;

  /********************************************
   * ПОСЛЕ ЗАГРУЗКИ
   ********************************************/
  @AfterLoad()
  async setComputed(): Promise<void> {
    let ret = undefined,
      id = 0;
    const reportExecutorEntityList = (await this.Reports) ?? [];
    reportExecutorEntityList?.map((item) => {
      if (item.id > id) {
        id = item.id;
        ret = item;
      }
    });
    this.ReportLast = ret;
  }
}
