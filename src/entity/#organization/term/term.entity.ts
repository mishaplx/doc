import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Справочник сроков хранения" })
@Entity({ name: "term", schema: "sad" })
@Unique(["nm"])
export class TermEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, type: "text" })
  @Field({ nullable: true })
  cd: string;

  @Column({ comment: "Наименование", type: "text" })
  @Field({ description: "Наименование" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false, comment: "Флаг удаления" })
  @Field({ nullable: true, description: "Флаг удаления" })
  del: boolean;

  @Column({ nullable: true, default: false, comment: "Флаг временной записи" })
  @Field({ nullable: true, description: "Флаг временной записи" })
  temp: boolean;
}
