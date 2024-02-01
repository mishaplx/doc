import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { JobLoopKindEnum, JobLoopMonthEnum } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { getJobLoopTitle } from "../../../modules/job/jobLoop/jobLoop.utils";
import { JobEntity } from "./job.entity";

@ObjectType({ description: "Повтор поручения" })
@Entity({ name: "job_loop", schema: "sad" })
export class JobLoopEntity {
  /********************************************
   * Поручение: id
   ********************************************/
  @Index()
  @PrimaryColumn({
    comment: "Поручение: id",
    nullable: false,
  })
  @Field(() => Int, {
    description: "Поручение: id",
    nullable: false,
  })
  job_id: number;

  /********************************************
   * Поручение: объект
   ********************************************/
  @OneToOne(() => JobEntity, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "job_id",
    foreignKeyConstraintName: "job_loop_fk",
  })
  @Field(() => JobEntity, {
    description: "Поручение: объект",
    nullable: false,
  })
  Job: Promise<JobEntity>;

  /********************************************
   * Начало повторов: дата
   ********************************************/
  @CreateDateColumn({
    nullable: false,
    comment: "Начало повторов: дата",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: false,
    description: "Начало повторов: дата",
  })
  start_date: Date;

  /********************************************
   * Завершение повторов: дата
   ********************************************/
  @Column({
    nullable: true,
    comment: "Завершение повторов: дата",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Завершение повторов: дата",
  })
  end_date: Date;

  /********************************************
   * Завершение повторов: количество циклов
   ********************************************/
  @Column({
    nullable: true,
    comment: "Завершение повторов: количество циклов",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Завершение повторов: количество циклов",
  })
  end_count: number;

  /********************************************
   * Периодичность: вид (день, неделя, ...)
   ********************************************/
  @Column({
    type: "enum",
    enum: JobLoopKindEnum,
    nullable: false,
    default: JobLoopKindEnum.day,
    comment: "Периодичность: вид (день, неделя, ...)",
  })
  @Field(() => JobLoopKindEnum, {
    nullable: false,
    defaultValue: JobLoopKindEnum.day,
    description: "Периодичность: вид (день, неделя, ...)",
  })
  loop_kind: JobLoopKindEnum;

  /********************************************
   * Периодичность: интервал
   ********************************************/
  @Column({
    nullable: false,
    default: 1,
    comment: "Периодичность: интервал",
  })
  @Field(() => Int, {
    nullable: false,
    defaultValue: 1,
    description: "Периодичность: интервал",
  })
  loop_interval: number;

  /********************************************
   * Дни недели (понедельник = 1)
   ********************************************/
  @Column({ nullable: false, default: false, comment: "Дни недели (понедельник)" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Дни недели (понедельник)",
  })
  loop_week_1: boolean;

  @Column({ nullable: false, default: false, comment: "Дни недели (вторник)" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Дни недели (вторник)",
  })
  loop_week_2: boolean;

  @Column({ nullable: false, default: false, comment: "Дни недели (среда)" })
  @Field(() => Boolean, { nullable: false, defaultValue: false, description: "Дни недели (среда)" })
  loop_week_3: boolean;

  @Column({ nullable: false, default: false, comment: "Дни недели (четверг)" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Дни недели (четверг)",
  })
  loop_week_4: boolean;

  @Column({ nullable: false, default: false, comment: "Дни недели (пятница)" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Дни недели (пятница)",
  })
  loop_week_5: boolean;

  @Column({ nullable: false, default: false, comment: "Дни недели (суббота)" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Дни недели (суббота)",
  })
  loop_week_6: boolean;

  @Column({ nullable: false, default: false, comment: "Дни недели (воскресенье)" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Дни недели (воскресенье)",
  })
  loop_week_7: boolean;

  /********************************************
   * Повторы для месяца
   ********************************************/
  @Column({
    nullable: true,
    type: "enum",
    enum: JobLoopMonthEnum,
    comment: "Повторы для месяца",
  })
  @Field(() => JobLoopMonthEnum, {
    nullable: true,
    description: "Повторы для месяца",
  })
  loop_month_type: JobLoopMonthEnum;

  /********************************************
   * Признак: периодичность установлена
   ********************************************/
  @Column({ nullable: false, default: false, comment: "Признак: периодичность установлена" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Признак: периодичность установлена",
  })
  done: boolean;

  /********************************************
   * Строковое представление (заполнение @AfterLoad)
   ********************************************/
  @Field(() => String, {
    nullable: false,
    description: "Строковое представление",
  })
  title: Promise<string>;

  /********************************************
   * ПОСЛЕ ЗАГРУЗКИ
   ********************************************/
  @AfterLoad()
  async setComputed(): Promise<void> {
    /********************************************
     * СТРОКОВОЕ ПРЕДСТАВЛЕНИЕ
     ********************************************/
    this.title = new Promise(async (resolve) => {
      resolve(getJobLoopTitle(this));
    });
  }
}
