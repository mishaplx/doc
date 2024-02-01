import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { MenuOptionsEntity } from "./menuOptions.entity";

@ObjectType({ description: "Операции" })
@Entity({ name: "operation", schema: "sad" })
@Unique(["name", "menu_options_id"])
export class OperationEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование ф-ции на сервере", type: "text" })
  @Field({ description: "Наименование ф-ции на сервере" })
  function_name: string;

  @Column({ type: "text", comment: "Наименование операции" })
  @Field({ description: "Наименование операции" })
  name: string;

  @Column({ comment: "Пункт меню" })
  @Field(() => Int, { description: "Пункт меню" })
  menu_options_id: number;

  @ManyToOne(() => MenuOptionsEntity, (menuOpt) => menuOpt.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "menu_options_id" })
  @Field(() => MenuOptionsEntity, {
    description: 'Сущность "Пункт меню"',
  })
  MenuOptions: MenuOptionsEntity;

  @Column({ default: false, comment: "Запись удалена" })
  @Field({ description: "Запись удалена" })
  del: boolean;
}
