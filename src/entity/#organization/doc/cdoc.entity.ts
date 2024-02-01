import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Класс документа" })
@Entity({ name: "cdoc", schema: "sad" })
@Index(["code", "nm"], { unique: true })
export class CdocEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: false, comment: "Код класса документа", length: 4 })
  @Field({ nullable: false, description: "Код класса документа" })
  code: string;

  @Column({ nullable: false, type: "text", comment: "Наименование класса документа" })
  @Field({ nullable: false, description: "Наименование класса документа" })
  nm: string;
}
