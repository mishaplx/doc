import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { Length } from "class-validator";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

import { reverseDate } from "../../../common/utils/utils.middleware";
import { onlyUpFirst, toUpFirst } from "../../../common/utils/utils.text";

@ObjectType({ description: "Cотрудники" })
@Entity({ name: "staff", schema: "sad" })
@Unique(["personnal_number"])
export class StaffEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, comment: "Имя", type: "text" })
  @Field({ nullable: false, description: "Имя" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false, comment: "Флаг удаления" })
  del: boolean;

  @Column({ nullable: true, default: false, comment: "Флаг временной записи" })
  temp: boolean;

  @Column({ nullable: true, comment: "Фамилия", type: "text" })
  @Field({ nullable: false, description: "Фамилия" })
  ln: string;

  @Column({ nullable: true, comment: "Отчество", type: "text" })
  @Field({ nullable: true, description: "Отчество" })
  mn: string;

  @Column({ nullable: true, comment: "Табельный номер", type: "text" })
  @Field({ nullable: true, description: "Табельный номер" })
  personnal_number: string;

  @Column({ nullable: true, comment: "Эл. почта", type: "text" })
  @Field({ nullable: false, description: "Эл. почта" })
  eml: string;

  @Column({ nullable: true, comment: "Телефон", type: "text" })
  @Field({ nullable: false, description: "Телефон" })
  @Length(3, 15)
  phone: string;

  @Column({ nullable: true, comment: "Дата рожд.", type: "date" })
  @Field(() => String, {
    nullable: true,
    description: "Дата рожд.",
    middleware: [reverseDate],
  })
  dob: Date;

  @Column({
    nullable: true,
    comment: "user_id",
    type: "integer",
    unique: true
  })
  @JoinColumn({ name: "" })
  @Field({
    nullable: true,
    description: "id пользователя если null то пользователя нет",
  })
  user_id: number;

  @Field(() => Boolean, {
    nullable: true,
    description: "Существует ли у Сотрудника пользователь",
  })
  get isHasUser(): boolean {
    return !!this.user_id;
  }

  @Field(() => String, { nullable: true })
  get FIO(): string {
    this.checkValidName(this.nm);
    this.checkValidName(this.ln);
    return (
      toUpFirst({ str: this.ln, postfix: ' ' }) +
      onlyUpFirst({ str: this.nm, postfix: '.' }) +
      onlyUpFirst({ str: this.mn, postfix: '.' })
    ).trim();
  }

  @Field(() => String, { nullable: true })
  get fullFIO(): string {
    this.checkValidName(this.nm);
    this.checkValidName(this.ln);
    return (
      toUpFirst({ str: this.ln, postfix: ' ' }) +
      toUpFirst({ str: this.nm, postfix: ' ' }) +
      toUpFirst({ str: this.mn })
    );
  }

  checkValidName(str: string): void {
    if (typeof str !== "string" || str.length === 0) {
      throw new Error("Name is invalid");
    }
  }
}
