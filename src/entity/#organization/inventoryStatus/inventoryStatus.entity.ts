import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Статус описи" })
@Entity({ name: "inventory_status", schema: "sad" })
@Index(["nm"], { unique: true, where: "del = false" })
export class InventoryStatusEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование статуса описи", type: "text" })
  @Field({ description: "Наименование статуса описи" })
  nm: string;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;
}
