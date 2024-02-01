import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Язык документа" })
@Entity({ name: "language", schema: "sad" })
@Index(["nm"], { unique: true, where: "del = false" })
export class LanguageEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование языка", type: "text" })
  @Field({ description: "Наименование языка" })
  nm: string;

  @Column({ nullable: true, comment: "RU код", type: "text" })
  @Field({ nullable: true, description: "RU код" })
  char_code_ru: string;

  @Column({ nullable: true, comment: "EN код", type: "text" })
  @Field({ nullable: true, description: "EN код" })
  char_code_en: string;

  @Column({ nullable: true, comment: "Цифровой код", type: "text" })
  @Field({ nullable: true, description: "Цифровой код" })
  digit_code: string;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;
}
