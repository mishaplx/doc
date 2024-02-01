import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Статусы Проектов" })
@Entity({ name: "project_statuses", schema: "sad" })
export class ProjectStatusEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true, comment: "Флаг удаления" })
  del: boolean;

  @Column({ comment: "Название (статус проектов)" })
  @Field(() => String, { description: "Название поручений(статус проектов)" })
  nm: string;
}
