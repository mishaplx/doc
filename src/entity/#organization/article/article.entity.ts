import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TermEntity } from "../term/term.entity";

@ObjectType({ description: "Справочник статей хранения" })
@Entity({ name: "article", schema: "sad" })
export class ArticleEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: false, type: "text" })
  @Field({ nullable: false, description: "Код статьи" })
  cd: string;

  @Column({ nullable: false, comment: "Наименование статьи", type: "text" })
  @Field({ nullable: false, description: "Наименование статьи" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: false, default: false })
  @Field({ nullable: false })
  del: boolean;

  @Column({ nullable: false, default: false })
  @Field({ nullable: false })
  temp: boolean;

  @ManyToOne(() => TermEntity, (term) => term.id)
  @JoinColumn({ name: "term_id", foreignKeyConstraintName: "term_id_FK" })
  @Field(() => TermEntity, { nullable: true })
  term: Promise<TermEntity>;

  @Column({ comment: "Ссылка на статью хранения" })
  @Field(() => Int, { nullable: true, description: "Ссылка на статью хранения" })
  term_id: number;

  @Column({ nullable: false, default: true, comment: "c" })
  @Field({ nullable: false, description: "Ссылка на статью хранения" })
  is_actual: boolean;
}
