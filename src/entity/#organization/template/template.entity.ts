import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
// зачем эта таблица???
@ObjectType()
@Entity({ name: "template", schema: "sad" })
export class TemplateEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field({ nullable: false })
  docroute: number;

  @Column()
  @Field({ nullable: false })
  nm: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  del: boolean;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  temp: boolean;
}
