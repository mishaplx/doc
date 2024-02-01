import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { RegionEntity } from "../region/region.entity";
import { onlyUpFirst, toUpFirst } from "../../../common/utils/utils.text";

@ObjectType({ description: "справочника физ. лиц" })
@Entity({ name: "citizen", schema: "sad" })
export class CitizenEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, comment: "Адрес" })
  @Field({ nullable: true, description: "Адрес" })
  addr: string;

  @Column({ nullable: false, default: false, comment: "флаг удаления" })
  @Field({ nullable: true, defaultValue: false, description: "флаг удаления" })
  del: boolean;

  @Column({ nullable: false, comment: "дата создания" })
  @Field({ nullable: true, description: "дата создания" })
  dtc: Date;

  @Column({ nullable: false, comment: "Почта" })
  @Field({ nullable: false, description: "Почта" })
  email: string;

  @Column({ nullable: true, comment: "Полное имя" })
  @Field({ nullable: true, description: "Полное имя" })
  flnm: string;

  @Column({ nullable: false, comment: "фамилия" })
  @Field({ nullable: false, description: "фамилия" })
  ln: string;

  @Column({ nullable: true, comment: "Отчество" })
  @Field({ nullable: true, description: "Отчество" })
  mn: string;

  @Column({ nullable: false, comment: "имя физ. лица" })
  @Field({ nullable: false, description: "имя физ. лица" })
  nm: string;

  @Column({ nullable: true, comment: "region_id" })
  region_id: number;

  @Field(() => RegionEntity, { description: "Регион" })
  @ManyToOne(() => RegionEntity, (region) => region.id)
  @JoinColumn({ name: "region_id", foreignKeyConstraintName: "region_id_FK" })
  region: Promise<RegionEntity>;

  @Column({ comment: "флаг временной записи" })
  temp: boolean;

  @Field(() => String, { nullable: true, description: "fio" })
  get FIO(): string {
    return (
      toUpFirst({ str: this.ln, postfix: ' ' }) +
      onlyUpFirst({ str: this.nm, postfix: '.' }) +
      onlyUpFirst({ str: this.mn, postfix: '.' })
    ).trim();
  }
}
