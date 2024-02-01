import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
// таблица шаблонов содержаний
@ObjectType()
@Entity({ name: "receiver", schema: "sad" })
export class ReceiverEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: "text" })
  @Field({ nullable: false })
  receiver_name: string;

  @Column({ nullable: true, default: false })
  @Field({ nullable: true, defaultValue: false })
  del: boolean;

  @Column({ nullable: true, default: false })
  temp: boolean;
}
