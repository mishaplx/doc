import { Field, Int, ObjectType } from "@nestjs/graphql";
import { SettingsTypeEnum } from "../../../BACK_SYNC_FRONT/enum/enum.settings";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "setting", schema: "sad" })
export class SettingEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: false, comment: "описание настроек" })
  @Field(() => String, { description: "описание настроек" })
  description: string;

  @Column({ nullable: true })
  del: boolean;

  @Column({ nullable: false, comment: "наименование настроек" })
  @Field(() => String, { description: "наименование настроек" })
  name: string;

  @Column({ nullable: false, comment: "значение настроек" })
  @Field(() => String, { description: "значение настроек" })
  value: string;

  @Column({ nullable: true, comment: "настроека смд" })
  @Field(() => Boolean, { description: "настроека смд" })
  smd: boolean;

  @Column({ nullable: true, comment: "обшие настройки" })
  @Field(() => Boolean, { description: "обшие настройки" })
  common: boolean;

  @Column({ nullable: true, comment: "доп. настройки" })
  @Field(() => Boolean, { description: "доп. настройки" })
  extra: boolean;

  @Column({ nullable: true, default: false, comment: "реквизиты" })
  @Field(() => Boolean, { nullable: true, defaultValue: false, description: "реквизиты" })
  props: boolean;

  @Column({
    type: "enum",
    enum: SettingsTypeEnum,
    nullable: false,
    default: SettingsTypeEnum.string,
    comment: "тип значения"
  })
  @Field(() => SettingsTypeEnum, {
    nullable: false,
    defaultValue: SettingsTypeEnum.string,
    description: "тип значения"
  })
  type_value: SettingsTypeEnum;

  /********************************************
   * Для типа number: минимальное значение
   ********************************************/
  @Column({
    nullable: true,
    comment: "Для типа number: минимальное значение",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Для типа number: минимальное значение",
  })
  int_min: number;

  /********************************************
   * Для типа number: максимальное значение
   ********************************************/
  @Column({
    nullable: true,
    comment: "Для типа number: максимальное значение",
  })
  @Field(() => Int, {
    nullable: true,
    description: "Для типа number: максимальное значение",
  })
  int_max: number;

  /********************************************
   * Для типа string: маска ввода
   ********************************************/
  @Column({
    nullable: true,
    comment: "Для типа string: маска ввода",
  })
  @Field(() => String, {
    nullable: true,
    description: "Для типа string: маска ввода",
  })
  str_mask: string;
}
