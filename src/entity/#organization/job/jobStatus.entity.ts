import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Статусы поручений" })
@Entity({ name: "job_statuses", schema: "sad" })
@Unique(["nm"])
export class JobStatusesEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;
  @Column({ nullable: true })
  del: false;
  @Column({ comment: "Название поручений(статус поручений)" })
  @Field({ description: "Название поручений(статус поручений)" })
  nm: string;
}
