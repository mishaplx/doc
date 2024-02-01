import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@InputType("project_action", { isAbstract: true })
@Entity({ name: "project_action", schema: "sad" })
export class ProjectActionEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true })
  del: boolean;

  @Column({ nullable: true, comment: "название этапа" })
  @Field({ nullable: true, description: "название этапа" })
  name: string;

  @Column({ nullable: true, comment: "название этапа" })
  @Field({ nullable: true, description: "название этапа" })
  name_declination: string;

  @Column({ nullable: true, comment: "действие в прошлом ,что было сделанно?" })
  @Field({
    nullable: true,
    description: "действие в прошлом ,что было сделанно?",
  })
  do_name: string;
}
