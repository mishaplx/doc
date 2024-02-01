import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ArticleEntity } from "../article/article.entity";

@ObjectType()
@Entity({ name: "nomenclatures", schema: "sad" })
@Index(["name"], { unique: true, where: "parent_id IS NULL AND del = false" })
@Index(["name", "parent_id"], { unique: true, where: "del = false" })
@Index(["index", "parent_id"], { unique: true, where: "del = false" })
@Index(["serial_number", "parent_id"], { unique: true, where: "del = false" })
@Check(`"parent_id" <> "id"`)
@Check(`"parent_id" ISNULL OR ("parent_id" NOTNULL AND "serial_number" NOTNULL)`)
export class NomenclaturesEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true, comment: "Вышестоящая номенклатура" })
  @Field(() => Int, { nullable: true, description: "Вышестоящая номенклатура" })
  parent_id: number;

  @ManyToOne(() => NomenclaturesEntity, (nmncl) => nmncl.id)
  @JoinColumn({ name: "parent_id" })
  @Field(() => NomenclaturesEntity, {
    nullable: true,
    description: "Сущность Вышестоящая номенклатура",
  })
  Parent: Promise<NomenclaturesEntity>;

  @Column({
    nullable: true,
    comment:
      "Вышестоящая номенклатура 1-ого уровня, для быстрого нажодения инф-ции о ней, избегая рекурсию при селекте",
  })
  @Field(() => Int, { nullable: true, description: "Вышестоящая номенклатура 1-ого уровня" })
  main_parent_id: number;

  @ManyToOne(() => NomenclaturesEntity, (nmncl) => nmncl.id)
  @JoinColumn({ name: "main_parent_id" })
  @Field(() => NomenclaturesEntity, {
    nullable: true,
    description: "Сущность Вышестоящая номенклатура 1-ого уровня",
  })
  MainParent: Promise<NomenclaturesEntity>;

  @OneToMany(() => NomenclaturesEntity, (nmncl) => nmncl.Parent)
  @Field(() => [NomenclaturesEntity], {
    nullable: true,
    description: "Нижестоящая номенклатура",
  })
  Children: Promise<NomenclaturesEntity[]>;

  @Column({ type: "text", comment: "Наименование" })
  @Field({ description: "Наименование" })
  name: string;

  @Column({ nullable: true, type: "text", comment: "Индекс" })
  @Field({ nullable: true, description: "Индекс" })
  index: string;

  @Column({ nullable: true, type: "text", comment: "Примечание" })
  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Column({ nullable: true, type: "text", comment: "Комментарий по хранению" })
  @Field({ nullable: true, description: "Комментарий по хранению" })
  storage_comment: string;

  @Column({ nullable: true, comment: "Статья хранения" })
  @Field(() => Int, { nullable: true, description: "Статья хранения" })
  article_id: number;

  @ManyToOne(() => ArticleEntity, (article) => article.id)
  @JoinColumn({ name: "article_id" })
  @Field(() => ArticleEntity, {
    nullable: true,
    description: "Сущность Статья хранения",
  })
  Article: Promise<ArticleEntity>;

  @Column({ nullable: true, comment: "Порядковый номер, для отображения" })
  @Field(() => Int, { nullable: true, description: "Порядковый номер, для отображения" })
  serial_number: number;

  @Column({ default: false, comment: "Запись удалена" })
  @Field({ description: "Запись удалена" })
  del: boolean;
}
