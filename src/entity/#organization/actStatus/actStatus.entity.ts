import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Статус акта" })
@Entity({ name: "act_status", schema: "sad" })
@Index(["nm"], { unique: true, where: "del = false" })
export class ActStatusEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование статуса акта", type: "text" })
  @Field({ description: "Наименование статуса акта" })
  nm: string;

  @Column({ default: false, comment: "Запись удалена" })
  @Field({ description: "Запись удалена" })
  del: boolean;
}
