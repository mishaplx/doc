import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SmdoAbonentsEntity } from "./smdo_abonents.entity";
import { SmdoPackagesEntity } from "./smdo_packages.entity";

@ObjectType({ description: "Получатели Пакетов СМДО" })
@Entity({ name: "smdo_packages_receivers", schema: "sad" })
export class SmdoPackagesReceiversEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  /** ID Пакета в СМДО */
  @Column({ nullable: true, type: "text", comment: "packageSmdoId" })
  @Field({ nullable: true, description: "ID Пакета в СМДО" })
  packageSmdoId: string;

  /** ID Абонента в СМДО */
  @Column({ nullable: true, type: "text", comment: "abonentSmdoId" })
  @Field({ nullable: true, description: "ID абонента в СМДО" })
  abonentSmdoId: string;

  /** Организация СМДО */
  @ManyToOne(() => SmdoAbonentsEntity)
  @JoinColumn({ name: "abonentSmdoId", referencedColumnName: "smdoId" })
  @Field(() => SmdoAbonentsEntity, {
    nullable: true,
    description: "Организация получатель",
  })
  ToAbonent: Promise<SmdoAbonentsEntity>;

  /** Пакет СМДО */
  @ManyToOne(() => SmdoPackagesEntity, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "packageSmdoId", referencedColumnName: "smdoId" })
  @Field(() => SmdoPackagesEntity, {
    nullable: true,
    description: "Организация отправитель",
  })
  PackageSmdo: Promise<SmdoPackagesEntity>;
}
