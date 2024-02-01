import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Тип документа" })
@Entity({ name: "kdoc", schema: "sad" })
@Unique(["nm"])
export class KdocEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование типа документа", type: "text" })
  @Field({ description: "Наименование типа документа" })
  nm: string;

  @Column({ nullable: true, comment: "Флаг удаления" })
  del: boolean;

  @Column({ nullable: false, default: true, comment: "доступность для изменения" })
  @Field({ nullable: false, description: "доступность для изменения" })
  can_be_edited: boolean;
}
