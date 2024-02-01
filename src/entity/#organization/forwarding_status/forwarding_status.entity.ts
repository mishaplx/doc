import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "статус передачи/пересылки" })
@Entity({ name: "forwarding_status", schema: "sad" })
export class Forwarding_statusEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "название статуса передачи/пересылки" })
  @Field(() => String, {
    nullable: false,
    description: "название статуса передачи/пересылки",
  })
  nm: string;

  @Column({ nullable: true })
  del: boolean;
}
