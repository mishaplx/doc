import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
// таблица шаблонов содержаний
@ObjectType()
@Entity({ name: "template_content", schema: "sad" })
export class TemplateContentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: "text" })
  @Field({ nullable: false })
  text: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  del: boolean;

  @Column({ nullable: true, default: false })
  temp: boolean;
}
