import { Field, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ProjectActionEntity } from "./ProjectAction.entity";
import { ProjectEntity } from "./project.entity";

@ObjectType({ description: "один этап маршрута" })
@Entity({ name: "project_current_route", schema: "sad" })
export class ProjectCurrentRouteEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    comment: "id проекта",
    type: "int",
  })
  @Field({
    description: "id проект",
    nullable: false,
  })
  id: number;

  /********************************************
   * Стадия: id (Визировать Подписать Утвердить)
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Стадия: id",
  })
  @Field({
    nullable: false,
    description: "Стадия: id",
  })
  stage_id: number;

  /********************************************
   * Стадия: объект (Визировать Подписать Утвердить)
   ********************************************/
  @ManyToOne(() => ProjectActionEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "stage_id",
    foreignKeyConstraintName: "project_curroute_action_fk",
  })
  @Field(() => ProjectActionEntity, {
    nullable: false,
    description: "Стадия: объект",
  })
  Stage: Promise<ProjectActionEntity>;

  @Column({
    comment: "id проекта",
    type: "int",
    nullable: false,
  })
  @Column({ comment: "флаг на доработку", nullable: true })
  @Field({
    defaultValue: false,
    description: "флаг на доработку",
    nullable: false,
  })
  flag_for_revision: boolean;

  @Column({ comment: "Закрыть", nullable: true })
  @Field({
    defaultValue: false,
    description: "Закрыть",
    nullable: false,
  })
  flag_close: boolean;

  @Column({ comment: "С замечаниями", nullable: true })
  @Field({
    defaultValue: false,
    description: "С замечаниями",
    nullable: false,
  })
  flag_with_remarks: boolean;

  @Column({ comment: "с эцп", nullable: true })
  @Field({
    defaultValue: false,
    description: "с эцп",
    nullable: false,
  })
  flag_with_signature: boolean;

  @Column({ comment: "Добавление", nullable: true })
  @Field({
    defaultValue: false,
    description: "Добавление",
    nullable: false,
  })
  flag_for_do: boolean;

  /********************************************
   * Проект: id
   ********************************************/
  @Index()
  @Column({
    nullable: false,
    comment: "Проект: id",
  })
  @Field({
    nullable: false,
    description: "Проект: id",
  })
  project_id: number;

  /********************************************
   * Проект: объект
   ********************************************/
  @ManyToOne(() => ProjectEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "project_id",
    foreignKeyConstraintName: "project_curroute_project_fk",
  })
  @Field(() => ProjectEntity, {
    nullable: false,
    description: "Стадия: объект",
  })
  Project: Promise<ProjectEntity>;
}
