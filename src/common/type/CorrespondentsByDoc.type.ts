import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PrimaryGeneratedColumn } from "typeorm";
import { OrgEntity } from "../../entity/#organization/org/org.entity";

@ObjectType()
export class CorrespondentsByDoc {
  @Field({
    description: "Подписант",
    nullable: true,
  })
  author: string;

  @Field({ nullable: false })
  def: boolean;

  @Field(() => Int, {
    description: "id документа",
    nullable: false,
  })
  doc: number;

  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Field({
    description: "Флаг - основной корреспондент или дополнительный",
    nullable: false,
  })
  ismain: boolean;

  @Field({
    description: "Исходящий №",
    nullable: true,
  })
  numout: string;

  @Field({
    description: "id организации",
    nullable: false,
  })
  org: number;

  @Field({
    description: "Дата",
    nullable: true,
  })
  outd: Date;

  @Field({ description: "информация об организации" })
  orgInfo: OrgEntity;
}
