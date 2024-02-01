import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { Length } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DocEntity } from "../doc/doc.entity";
import { EmpEntity } from "../emp/emp.entity";
import { Forwarding_statusEntity } from "../forwarding_status/forwarding_status.entity";
import { Forwarding_viewEntity } from "../forwarding_view/forwarding_view.entity";

@ObjectType({ description: "передача/пересылка" })
@Entity({ name: "forwarding", schema: "sad" })
export class ForwardingEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ default: false })
  @Field({ nullable: false })
  del: boolean;

  @Column()
  @Field({ nullable: false })
  temp: boolean;

  @ManyToOne(() => DocEntity, (doc) => doc.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "id_doc", foreignKeyConstraintName: "forward_Fk" })
  @Field(() => DocEntity)
  Doc: Promise<DocEntity>;

  @Column({
    comment: "id_doc",
    nullable: false,
    type: "integer",
  })
  @Field({ nullable: false, description: "id_doc" })
  id_doc: number;

  @CreateDateColumn({
    comment: "дата создания записи",
  })
  dtc: Date;

  @Column({
    nullable: false,
    comment: "ФИО лица, создавшего Передачу/Пересылку",
    type: "integer",
  })
  @Field({
    nullable: false,
    description: "ФИО лица, создавшего Передачу/Пересылку",
  })
  emp_creator: number;

  @Column({
    comment: "Статус документа по передаче/пересылке",
    nullable: true,
  })
  status_id: number;

  @ManyToOne(() => Forwarding_statusEntity, (status) => status.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "status_id",
    foreignKeyConstraintName: "status_id_FK",
    referencedColumnName: "id",
  })
  @Field(() => Forwarding_statusEntity, {
    nullable: true,
    description: "Статус документа по передаче/пересылке",
  })
  Status: Promise<Forwarding_statusEntity>;

  @Column({
    comment: "Комментарий по завершению передачи/пересылки",
    nullable: true,
  })
  @Field({
    nullable: true,
    description: "Комментарий по завершению передачи/пересылки",
  })
  comment_end: string;

  @Column({
    nullable: true,
    comment: "Примечание по передаче/пересылке",
    type: "text",
  })
  @Length(0, 300)
  @Field({
    nullable: true,
    description: "Примечание по передаче/пересылке",
  })
  note: string;

  @Column({
    nullable: false,
    comment: "Вид передачи/пересылки",
    type: "int2",
  })
  veiw_id: number;

  @ManyToOne(() => Forwarding_viewEntity, (veiw) => veiw.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "veiw_id",
    foreignKeyConstraintName: "veiw_id_FK",
    referencedColumnName: "id",
  })
  @Field(() => Forwarding_viewEntity, {
    nullable: false,
    description: "Вид передачи/пересылки",
  })
  Veiw: Promise<Forwarding_viewEntity>;

  @Column({
    nullable: false,
    comment: " ФИО и должность получателя документа по передаче/пересылке.",
    type: "integer",
  })
  @Field({
    nullable: false,
    description: " ФИО и должность получателя документа по передаче/пересылке.",
  })
  emp_receiver: number;

  @Column({
    nullable: true,
    comment: "Дата и время передачи/пересылки",
    type: "timestamp",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: " Дата и время передачи/пересылки",
  })
  date_sender: Date;

  @Column({
    nullable: true,
    comment: "Завершение по пересылке (Закрытие по пересылке)",
    type: "timestamp",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Завершение по пересылке (Закрытие по пересылке)",
  })
  date_end_sender: Date;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([
    {
      name: "emp_creator",
      referencedColumnName: "id",
      foreignKeyConstraintName: "emp_creator_FK",
    },
  ])
  @Field(() => EmpEntity, {
    nullable: false,
    description: "ФИО лица, создавшего Передачу/Пересылку",
  })
  Emp_creator: Promise<EmpEntity>;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([
    {
      name: "emp_receiver",
      referencedColumnName: "id",
      foreignKeyConstraintName: "emp_receiver_FK",
    },
  ])
  @Field(() => EmpEntity, {
    nullable: false,
    description: " ФИО и должность получателя документа по передаче/пересылке.",
  })
  Emp_receiver: Promise<EmpEntity>;

  /**
   * Уведомлять emp_creator об утверждении поручений
   */
  @Column({
    nullable: false,
    default: false,
    comment: "Уведомлять emp_creator об утверждении поручений",
  })
  @Field({
    nullable: false,
    defaultValue: false,
    description: "Уведомлять emp_creator об утверждении поручений",
  })
  is_notify_emp_creator: boolean;
}
