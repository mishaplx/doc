import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "docstatus", schema: "sad" })
export class DocStatusEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column()
  @Field({ nullable: true })
  nm: string;

  @Column()
  @Field({ nullable: false })
  isstart: boolean;

  @Column({ default: false })
  @Field({ nullable: false })
  del: boolean;

  @Column()
  @Field({ nullable: false })
  temp: boolean;
}
