import { Field, Int, ObjectType } from "@nestjs/graphql";
import { IsDate } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Получение данных (Уровень доступа)" })
@Entity({ name: "priv", schema: "sad" })
export class PrivEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column()
  @Field({ nullable: false })
  nm: string;

  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания",
  })
  @Field({ description: "дата создания записи" })
  @IsDate()
  dtc: Date;

  @Column({ nullable: false, default: false })
  @Field({ description: "флаг – удалена запись или нет" })
  del: boolean;

  @Column({ nullable: false })
  @Field({ description: "флаг – запись временная или нет" })
  temp: boolean;
}
