import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@InputType("project_sub_action", { isAbstract: true })
@Entity({ name: "project_sub_action", schema: "sad" }) //
export class ProjectSubActionEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({
    comment: "наименование действия",
    type: "text",
  })
  @Field(() => String, {
    description: "наименование под-действия На доработку Закрыть С ЭЦП и т.д.",
    nullable: true,
  })
  name_sub_action: string;
  @Column({ nullable: true })
  del: boolean;
  flag: boolean;

  @Column({ type: "text" })
  @Field(() => String)
  full_name: string;
}
