import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Наименование описи" })
@Entity({ name: "inventory_name", schema: "sad" })
@Index(["nm"], { unique: true, where: "del = false" })
export class InventoryNameEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ comment: "Наименование описи", type: "text" })
  @Field({ description: "Наименование описи" })
  nm: string;

  @Column({ nullable: true, comment: "Краткое наименование описи", type: "text" })
  @Field({ nullable: true, description: "Краткое наименование описи" })
  short_nm: string;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;
}
