import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Регион" })
@Entity({ name: "region", schema: "sad" })
@Unique(["nm"])
export class RegionEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "Наименование региона", type: "text" })
  @Field({ description: "Наименование региона" })
  nm: string;

  @Column({ type: "boolean", default: false, comment: "Флаг временной записи" })
  @Field({ defaultValue: false, nullable: true, description: "Флаг временной записи" })
  temp: boolean;
  @Column({ comment: "Флаг удаления", type: "boolean", nullable: true, default: false })
  del: boolean;
}
