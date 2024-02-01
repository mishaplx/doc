import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@ObjectType({ description: "Должности" })
@Entity({ name: "post", schema: "sad" })
@Unique(["nm"])
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "Наименование", type: "text" })
  @Field({ description: "Наименование" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  del: boolean;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true })
  temp: boolean;
}
