import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Статус дела" })
@Entity({ name: "doc_package_status", schema: "sad" })
@Index(["nm"], { unique: true, where: "del = false" })
export class DocPackageStatusEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование статуса дела", type: "text" })
  @Field({ description: "Наименование статуса дела" })
  nm: string;

  @Column({ default: false, comment: "Запись удалена" })
  @Field({ description: "Запись удалена" })
  del: boolean;
}
