import { Field, InputType, Int } from "@nestjs/graphql";
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@InputType("upadeTypeDoc")
export class UpdateTypeJobDto {
  @Field(() => Int)
  id!: number;

  @Field({ nullable: true })
  nm: string;

  @Field({ nullable: true })
  default_emp_id?: number;

  @Field({ nullable: true })
  dtc: Date;

  @Field({ nullable: true, defaultValue: false })
  del: boolean;

  @Field({ nullable: false, defaultValue: false })
  temp: boolean;
}
