import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Пункты меню" })
@Entity({ name: "menu_options", schema: "sad" })
@Unique(["nm"])
export class MenuOptionsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование пункта меню", type: "text" })
  @Field({ description: "Наименование пункта меню" })
  nm: string;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;
}
