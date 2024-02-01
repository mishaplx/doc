import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ObjectType({ description: "Тип доставки-отправки" })
@Entity({ name: "delivery", schema: "sad" })
@Unique(["nm"])
export class DeliveryEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "Наименование", type: "text" })
  @Field({ description: "Наименование" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false, comment: "флаг удаления" })
  del: boolean;
  @Column({ nullable: true, default: false, comment: "флаг временной записи" })
  temp: boolean;
  @Column({ nullable: false, default: true, comment: "доступность для изменения" })
  @Field({ nullable: false, description: "доступность для изменения" })
  can_be_edited: boolean;
}
