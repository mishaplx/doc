import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CitizenEntity } from "../citizen/citizen.entity";
import { DeliveryEntity } from "../delivery/delivery.entity";
import { DocEntity } from "../doc/doc.entity";
import { OrgEntity } from "../org/org.entity";

@ObjectType()
@Entity({ name: "fromwh", schema: "sad" })
export class CorrespondentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, comment: "Подписант", type: "text" })
  @Field(() => Int, { nullable: true, description: "Подписант" })
  emp_id_author: number;

  @Column({ nullable: true, default: false, comment: "флаг удаления" })
  @Field({ nullable: true, defaultValue: false, description: "флаг удаления" })
  del: boolean;

  @Column({ nullable: true, default: false, comment: "флаг временной записи" })
  @Field({ nullable: true, defaultValue: false, description: "флаг временной записи" })
  temp: boolean;

  @ManyToOne(() => DocEntity, (doc) => doc.id)
  @JoinColumn({ name: "doc_id", foreignKeyConstraintName: "doc_FK" })
  @Field(() => DocEntity, { nullable: true, description: "Документ" })
  Doc: Promise<DocEntity>;

  @Column({ nullable: true, comment: "Id документа" })
  @Field(() => Int, { nullable: true, description: "Id документа" })
  doc_id: number;

  @Column({
    nullable: true,
    comment: "Флаг - основной корреспондент или дополнительный",
    default: false,
  })
  @Field({
    nullable: true,
    description: "Флаг - основной корреспондент или дополнительный",
  })
  ismain: boolean;

  @Column({ nullable: true, comment: "Исходящий №", type: "text" })
  @Field({ nullable: true, description: "Исходящий №" })
  numout: string;

  @ManyToOne(() => OrgEntity, (org) => org.id)
  @JoinColumn({ name: "org", foreignKeyConstraintName: "corr_org_Fk" })
  @Field(() => OrgEntity, { nullable: true, description: "Организация" })
  Org: Promise<OrgEntity>;

  @ManyToOne(() => CitizenEntity, (citizen) => citizen.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "citizen_id", foreignKeyConstraintName: "citizen_Fk" })
  @Field(() => CitizenEntity, { nullable: true, description: " физ.лица" })
  Citizen: Promise<CitizenEntity>;

  @Column({ nullable: true, comment: "Id организации" })
  @Field({ nullable: true, description: "Id организации" })
  org: number;

  @Column({ nullable: true, comment: "Id физ.лица" })
  @Field({ nullable: true, description: "Id физ.лица" })
  citizen_id: number;

  @Column({ nullable: true, comment: "Дата отправки", type: "date" })
  @Field(() => String, {
    nullable: true,
    description: "Дата отправки",
  })
  outd: Date;

  @Column({ nullable: true, comment: "Дата фактической отправки", type: "date" })
  @Field(() => String, {
    nullable: true,
    description: "Дата фактической отправки",
  })
  date_fact: Date;

  @Column({ nullable: true, comment: "Id способа отправки" })
  @Field({ nullable: true, description: "Id способа отправки" })
  delivery_id: number;

  @ManyToOne(() => DeliveryEntity, (Delivery) => Delivery.id)
  @JoinColumn({
    name: "delivery_id",
    foreignKeyConstraintName: "Delivery_Fk",
    referencedColumnName: "id",
  })
  @Field(() => DeliveryEntity, {
    nullable: true,
    description: "способа отправки",
  })
  Delivery: Promise<DeliveryEntity>;
}
