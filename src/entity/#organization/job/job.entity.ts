import { ArgsType, Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  AfterLoad,
  BaseEntity,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Length } from "class-validator";
import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { mwJob } from "../../../common/utils/utils.middleware";
import { DocEntity } from "../doc/doc.entity";
import { EmpEntity } from "../emp/emp.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";
import { HistoryResponsibleEntity } from "../history_responsible/history_responsible.entity";
import { NotifyEntity } from "../notify/notify.entity";
import { RejectCommentEntity } from "../reject_comment/reject_comment.entity";
import { RlsAccessEmpEntity } from "../rls/rls.access.emp.entity";
import { RlsAccessGroupEntity } from "../rls/rls.access.group.entity";
import { SignEntity } from "../sign/sign.entity";
import { TypeJobEntity } from "../typeJob/typeJob.entity";
import { JobApproveEntity } from "./jobApprove.entity";
import { JobControlEntity } from "./jobControl.entity";
import { ExecJobEntity } from "./jobExec.entity";
import { JobLoopEntity } from "./jobLoop.entity";
import { JobProlongRequestEntity } from "./jobProlongRequest.entity";
import { JobStatusesEntity } from "./jobStatus.entity";

@ArgsType()
@ObjectType({ description: "Поручения" })
@Entity({ name: "jobs", schema: "sad" })
@Check(`"parent_job_id" <> "id"`)
export class JobEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /**
   * Автор резолюции: объект
   */
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "author_id",
    foreignKeyConstraintName: "author_id_fk",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Автор резолюции: объект",
  })
  Author: Promise<EmpEntity>;

  /**
   * Автор резолюции: id
   */
  @Index()
  @Column({
    nullable: true,
    comment: "Автор резолюции: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Автор резолюции: id",
  })
  author_id: number;

  /**
   * Содержание резолюции
   */
  @Column({
    nullable: true,
    comment: "Содержание резолюции",
    type: "text",
  })
  @Length(0, 2000)
  @Field({
    nullable: true,
    description: "Содержание резолюции",
  })
  body: string;

  /**
   * Подпоручения
   */
  @OneToMany(() => JobEntity, (jobs) => jobs.ParentJob)
  @Field(() => [JobEntity], {
    nullable: true,
    description: "Подпоручения",
    middleware: [mwJob],
  })
  childrenJobs: Promise<JobEntity[]>;

  /**
   * Количество файлов по поручению (заполнение в getJobsById)
   */
  @Field(() => Int, {
    defaultValue: 0,
    description: "!!! ТОЛЬКО ДЛЯ getJobsById !!!\n\nКоличество файлов по поручению",
  })
  countFile: number;

  /**
   * Количество Исполнителей, проставивших отметку исполненно
   */
  @Field(() => Int, {
    defaultValue: 0,
    description: "Количество Исполнителей, проставивших отметку исполненно",
  })
  countExecIsFinally: number;

  /**
   * Признак удаления
   */
  @Column({
    nullable: false,
    default: false,
  })
  @Field({
    nullable: false,
    defaultValue: false,
  })
  del: boolean;

  /**
   * Документ, к которому создавалось поручение
   */
  @ManyToOne(() => DocEntity, (doc) => doc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "doc_id",
    foreignKeyConstraintName: "doc_id_fk",
  })
  @Field(() => DocEntity, {
    nullable: true,
  })
  Doc: Promise<DocEntity>;

  /**
   * Документ: id
   */
  @Index()
  @Column({
    nullable: true,
    comment: "Документ: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Документ: id",
  })
  doc_id: number;

  /**
   * Дата создания поручения в БД
   */
  @CreateDateColumn({
    nullable: true,
    comment: "Дата создания",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  /**
   * Исполнители поручения
   */
  @OneToMany(() => ExecJobEntity, (item) => item.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [ExecJobEntity], {
    nullable: true,
    description: "Исполнители поручения",
  })
  Exec_job: Promise<ExecJobEntity[]>;

  /********************************************
   * Дата направления на исполнение
   ********************************************/
  @Column({
    nullable: true,
    comment: "Дата направления на исполнение",
  })
  @Field({
    nullable: true,
    description: "Дата направления на исполнение",
  })
  execution_start: Date;

  /**
   * Исполнить до
   */
  @Column({
    nullable: true,
    comment: "Исполнить до",
  })
  @Field({
    nullable: true,
    description: "Исполнить до",
  })
  execution_date: Date;

  /**
   * Фактическое исполнение (дата снятия поручения с контроля)
   */
  @Column({
    nullable: true,
    comment: "Фактическое исполнение (дата снятия поручения с контроля)",
  })
  @Field({
    nullable: true,
    description: "Фактическое исполнение (дата снятия поручения с контроля)",
  })
  fact_date: Date;

  /********************************************
   * История назначения сводящих по поручению
   ********************************************/
  @OneToMany(() => HistoryResponsibleEntity, (history) => history.Job)
  @Field(() => [HistoryResponsibleEntity], {
    description: "История назначения сводящих по поручению: список объектов",
    nullable: true,
  })
  HistoryResponsible: Promise<HistoryResponsibleEntity[]>;

  /**
   * Утверждение поручения: запрос + решение
   */
  @OneToMany(() => JobApproveEntity, (item) => item.Job)
  @Field(() => [JobApproveEntity], {
    description: "Утверждение поручения: запрос + решение",
    nullable: true,
  })
  JobApprove: Promise<JobApproveEntity[]>;

  /**
   * Контроль поручения
   */
  @OneToMany(() => JobControlEntity, (jobControl) => jobControl.Job, {
    nullable: true,
  })
  @Field(() => [JobControlEntity], {
    description: "Контроль поручения",
    nullable: true,
  })
  JobControl: Promise<JobControlEntity[]>;

  /********************************************
   * ЭЦП поручения
   ********************************************/
  @OneToMany(() => SignEntity, (item) => item.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [SignEntity], {
    nullable: true,
    description: "ЭЦП поручения",
  })
  Sign: Promise<SignEntity[]>;

  /**
   * Файлы резолюции
   */
  @OneToMany(() => FileBlockEntity, (file_block) => file_block.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [FileBlockEntity], {
    nullable: true,
    description: "Файлы резолюции",
  })
  FileBlock: Promise<FileBlockEntity[]>;

  /**
   * RLS доступ по emp_id
   */
  @OneToMany(() => RlsAccessEmpEntity, (item) => item.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessEmpEntity], {
    nullable: true,
    description: "RLS доступ по emp_id",
  })
  RlsAccessEmp: Promise<RlsAccessEmpEntity[]>;

  /**
   * RLS доступ по group_id
   */
  @OneToMany(() => RlsAccessGroupEntity, (item) => item.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RlsAccessGroupEntity], {
    nullable: true,
    description: "RLS доступ по group_id",
  })
  RlsAccessGroup: Promise<RlsAccessGroupEntity[]>;

  /**
   * Номер поручения
   */
  @Column({
    nullable: true,
    comment: "Номер поручения",
  })
  @Field(() => String, {
    nullable: true,
    description: "Номер поручения",
  })
  num: string;

  /**
   * Вышестоящее поручение: объект
   */
  @ManyToOne(() => JobEntity, (job) => job.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "parent_job_id",
    foreignKeyConstraintName: "parent_job_id_FK",
  })
  @Field(() => JobEntity, {
    nullable: true,
    description: "Вышестоящее поручение: объект",
  })
  ParentJob: Promise<JobEntity>;

  /**
   * Вышестоящее поручение: id
   */
  @Index()
  @Column({
    nullable: true,
    comment: "Вышестоящее поручение: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Вышестоящее поручение: id",
  })
  parent_job_id: number;

  /**
   * Вышестоящее поручение 1-ого уровня
   */
  @Index()
  @Column({
    nullable: true,
    comment: "Вышестоящее поручение 1-ого уровня",
  })
  main_job_id: number;

  @ManyToOne(() => JobEntity, (job) => job.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "main_job_id",
    foreignKeyConstraintName: "main_job_fk",
  })
  MainJob: Promise<JobEntity>;

  /**
   * Причины отказа по поручению
   */
  @OneToMany(() => RejectCommentEntity, (rejectComment) => rejectComment.Job, {
    nullable: true,
  })
  @Field(() => [RejectCommentEntity], {
    description: "Причины отказа по поручению",
    nullable: true,
  })
  RejectComment: Promise<RejectCommentEntity[]>;

  /**
   * Статус поручения: объект
   */
  @ManyToOne(() => JobStatusesEntity, (jobStatus) => jobStatus.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "status_id",
    foreignKeyConstraintName: "status_id_fk",
  })
  @Field(() => JobStatusesEntity, {
    nullable: true,
    description: "Статус поручения: объект",
  })
  // может ли быть статус с значение null???
  Status: Promise<JobStatusesEntity> | null;

  /**
   * Статус поручения: id
   */
  @Column({
    nullable: false,
    comment: "Статус поручения: id",
  })
  @Field(() => Int, {
    nullable: false,
    description: "Статус поручения: id",
  })
  status_id: number;

  /**
   * Признак временной записи
   */
  @Column({
    nullable: true,
    default: false,
    comment: "Признак временной записи",
  })
  @Field({
    nullable: true,
    description: "Признак временной записи",
  })
  temp: boolean;

  /**
   * Создатель: объект
   */
  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "user_created_id",
    foreignKeyConstraintName: "job_emp_created_FK",
  })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Создатель: объект",
  })
  UserCreated: Promise<EmpEntity>;

  /**
   * Создатель: id
   */
  @Index()
  @Column({
    nullable: true,
    comment: "Создатель: id",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Создатель: id",
  })
  user_created_id: number;

  /**
   * Тип поручения
   */
  @Index()
  @Column({ nullable: true, comment: "тип поручения" })
  @Field(() => Int, {
    nullable: true,
    description: "тип поручения",
  })
  type_job: number;

  /**
   * Версия поручения. Формат версии XX
   */
  @Column({
    nullable: true,
    comment: "Версия поручения",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Версия поручения",
  })
  version: number;

  /**
   * Данные документа, к которому создавалось поручение
   */
  @Column({ nullable: true, type: "text" })
  @Field(() => String, {
    description: "Данные документа, к которому создавалось поручение",
    nullable: true,
  })
  name_doc_in_job: string;

  @Field(() => Boolean, {
    nullable: true,
    description: "Просроченные поручения.",
  })
  overdue: boolean;

  // FIXME: сделать заполнение в @AfterLoad
  @Field(() => Boolean, { nullable: true, description: "Срок истекает." })
  termExpires?: boolean;

  @ManyToOne(() => TypeJobEntity, (typejob) => typejob.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn({
    name: "type_job",
    foreignKeyConstraintName: "type_job_FK",
  })
  @Field(() => TypeJobEntity, {
    nullable: true,
    description: "тип поручения: объект",
  })
  TypeJob: Promise<TypeJobEntity>;

  /********************************************
   * Сообщения по поручению
   ********************************************/
  @OneToMany(() => NotifyEntity, (item) => item.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [NotifyEntity], {
    nullable: true,
    description: "Сообщения по поручению",
  })
  Notify: Promise<NotifyEntity[]>;

  /********************************************
   * Актуальный ответственный исполнитель (заполнение @AfterLoad)
   ********************************************/
  @Field(() => HistoryResponsibleEntity, {
    nullable: true,
    description: "Актуальный ответственный исполнитель: объект",
  })
  HistoryResponsibleActual: Promise<HistoryResponsibleEntity>;

  /********************************************
   * Актуальные исполнители (заполнение @AfterLoad)
   ********************************************/
  @Field(() => [ExecJobEntity], {
    nullable: true,
    description: "Актуальные исполнители: объект",
  })
  ExecJobActual: Promise<ExecJobEntity[]>;

  /********************************************
   * Текущий контроль (заполнение @AfterLoad)
   ********************************************/
  @Field(() => JobControlEntity, {
    nullable: true,
    description: "Текущий контроль: объект",
  })
  JobControlLast: Promise<JobControlEntity>;

  /********************************************
   * Запросы на продление срока: объекты
   ********************************************/
  @OneToMany(() => JobProlongRequestEntity, (item) => item.Job, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [JobProlongRequestEntity], {
    nullable: true,
    description: "Запросы на продление срока: объекты",
  })
  JobProlongRequests: Promise<JobProlongRequestEntity[]>;

  /********************************************
   * Актуальный запрос на продление срока: объект (заполнение @AfterLoad)
   ********************************************/
  @Field(() => JobProlongRequestEntity, {
    nullable: true,
    description: "Актуальный запрос на продление срока: объект",
  })
  JobProlongRequestActual: Promise<JobProlongRequestEntity>;

  /********************************************
   * Доступные операции (заполнение в getJobsById)
   ********************************************/
  @Field(() => [String], {
    defaultValue: [],
    description:
      "!!! ТОЛЬКО ДЛЯ getJobsById !!!\n\nДоступные операции (список): " +
      Object.values(ActionsJob).join(", "),
  })
  EnablingActions: string[];

  @Field(() => Boolean, {
    nullable: true,
    description: "Является ли поручение избранным)",
  })
  isFavorites?: boolean;

  /********************************************
   * Повтор поручения: объект
   ********************************************/
  @OneToOne(() => JobLoopEntity, (item) => item.Job, {
    nullable: true,
  })
  @Field(() => JobLoopEntity, {
    description: "Повтор поручения: объект",
    nullable: true,
  })
  JobLoop: Promise<JobLoopEntity>;

  /********************************************
   * Признак: периодичное подпоручение
   ********************************************/
  @Column({ nullable: false, default: false, comment: "периодичное подпоручение" })
  @Field(() => Boolean, {
    nullable: false,
    defaultValue: false,
    description: "Признак: периодичное подпоручение",
  })
  loop: boolean;

  /********************************************
   * ПОСЛЕ ЗАГРУЗКИ
   ********************************************/
  @AfterLoad()
  async setComputed(): Promise<void> {
    /********************************************
     * АКТУАЛЬНЫЙ ОТВЕТСТВЕННЫЙ ИСПОЛНИТЕЛЬ: ОБЪЕКТ
     ********************************************/
    this.HistoryResponsibleActual = new Promise(async (resolve) => {
      const historyResponsibleEntityList = (await this.HistoryResponsible) ?? [];
      // this.HistoryResponsible.sort((a, b) => a.id - b.id); так нельзя
      let ret = undefined,
        id = 0;
      historyResponsibleEntityList?.map((item) => {
        if (item.id > id && !item.date_end) {
          id = item.id;
          ret = item;
        }
      });
      resolve(ret);
    });

    /********************************************
     * АКТУАЛЬНЫЕ ИСПОЛНИТЕЛИ: СПИСОК ОБЪЕКТОВ
     ********************************************/
    this.ExecJobActual = new Promise(async (resolve) => {
      const jobExecEntityList = (await this.Exec_job) ?? [];
      resolve(jobExecEntityList?.filter((item) => !item.del));
    });

    /********************************************
     * ТЕКУЩИЙ КОНТРОЛЬ: ОБЪЕКТ
     ********************************************/
    this.JobControlLast = new Promise(async (resolve) => {
      let ret = undefined,
        id = 0;
      const jobControlEntityList = (await this.JobControl) ?? [];
      jobControlEntityList?.map((item) => {
        if (item.id > id) {
          id = item.id;
          ret = item;
        }
      });
      resolve(ret);
    });

    /********************************************
     * АКТУАЛЬНЫЙ ЗАПРОС НА ПРОДЛЕНИЕ СРОКА: ОБЪЕКТ
     ********************************************/
    this.JobProlongRequestActual = new Promise(async (resolve) => {
      let ret = undefined,
        id = 0;
      const jobProlongRequestEntityList = (await this.JobProlongRequests) ?? [];
      jobProlongRequestEntityList?.map((item) => {
        if (item.id > id && !item.date_prolong_resolv) {
          id = item.id;
          ret = item;
        }
      });
      resolve(ret);
    });
  }
}
