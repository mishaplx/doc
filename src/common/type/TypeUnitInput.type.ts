import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Column } from "typeorm";

@ArgsType()
@InputType({ isAbstract: true })
@ObjectType({ isAbstract: true, description: "Подразделения" })
export class TypeUnitInput {
  @Field(() => Int, {
    nullable: true,
  })
  id: number;

  @Field({ nullable: false, description: "Полное наименование" })
  nm: string;

  @Field({ nullable: true, description: "Сокращенное наименование" })
  short_name: string;

  @Field({ nullable: true, description: "дата создания" })
  dtc: Date;

  @Column({ nullable: false, default: false, comment: "флаг удаления" })
  del: boolean;

  @Column({ nullable: false })
  temp: boolean;

  @Field({ nullable: true })
  class: string;

  @Field({ nullable: true })
  responsible: boolean;

  @Field({ nullable: true })
  org: boolean;

  @Field({
    nullable: true,
    description: "родительское подразделение в идеале назвать parent_id,но может упасть фронт",
    defaultValue: null,
  })
  parent_id: number;

  treepath: string;
  @Field({ nullable: true })
  db: Date;

  @Field({ nullable: true })
  de: Date;

  @Field({ nullable: true })
  lvl: number;

  @Field(() => String, { nullable: false, description: "Код подразделения" })
  code: string;
}
