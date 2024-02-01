import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "вид передачи/пересылки" })
@Entity({ name: "forwarding_view", schema: "sad" })
export class Forwarding_viewEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;
  @Column({ comment: "название вида передачи/пересылки" })
  @Field(() => String, {
    nullable: false,
    description: "название вида передачи/пересылки",
  })
  nm: string;

  @Column({ nullable: true })
  del: boolean;
}
