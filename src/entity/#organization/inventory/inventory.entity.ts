import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { InventoryStatus } from "../../../common/enum/enum";
import { DocPackageEntity } from "../docPackage/docPackage.entity";
import { DocPackageStatusEntity } from "../docPackageStatus/docPackageStatus.entity";
import { EmpEntity } from "../emp/emp.entity";
import { InventoryNameEntity } from "../inventoryName/inventoryName.entity";
import { InventoryStatusEntity } from "../inventoryStatus/inventoryStatus.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";

@ObjectType({ description: "Описи" })
@Entity({ name: "inventory", schema: "sad" })
@Index(["number"], { unique: true, where: "del = false AND temp = false" })
export class InventoryEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn({ comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, { description: "Дата создания" })
  dtc: Date;

  @Column({ nullable: true, comment: "№ описи", length: 10 })
  @Field({ nullable: true, description: "№ описи" })
  number: string;

  @Column({ nullable: true, comment: "Наименование описи" })
  @Field(() => Int, { nullable: true, description: "Наименование описи" })
  inventory_name_id: number;

  @ManyToOne(() => InventoryNameEntity, (inventoryName) => inventoryName.id)
  @JoinColumn({ name: "inventory_name_id" })
  @Field(() => InventoryNameEntity, {
    nullable: true,
    description: "Наименование описи",
  })
  Name: Promise<InventoryNameEntity>;

  @Column({ nullable: true, comment: "Год", type: "text" })
  @Field({ nullable: true, description: "Год" })
  year: string;

  @Column({ nullable: true, comment: "Описание", length: 2000 })
  @Field({ nullable: true, description: "Описание" })
  description: string;

  @Column({ nullable: true, comment: "Подразделение", type: "text" })
  @Field({ nullable: true, description: "Подразделение" })
  unit: string;

  @Column({ nullable: true, comment: "Примечание к описи", length: 2000 })
  @Field({ nullable: true, description: "Примечание к описи" })
  nt: string;

  @Column({ comment: "Количество дел", default: 0 })
  @Field(() => Int, { description: "Количество дел" })
  count_doc_package: number;

  @Column({ nullable: true, comment: "Начальная дата документов", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Начальная дата документов" })
  start_date: Date;

  @Column({ nullable: true, comment: "Конечная дата документов", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Конечная дата документов" })
  end_date: Date;

  @Column({ comment: "Количество документов", default: 0 })
  @Field(() => Int, { description: "Количество документов" })
  count_doc: number;

  @Column({ comment: "Общий объем документов (байт)", default: 0 })
  @Field(() => Int, { description: "Общий объем документов (байт)" })
  total_files_size: number;

  @Column({ comment: "Статус", default: InventoryStatus.NEW })
  @Field(() => Int, { description: "Статус" })
  status_id: number;

  @ManyToOne(() => InventoryStatusEntity, (status) => status.id)
  @JoinColumn({ name: "status_id" })
  @Field(() => InventoryStatusEntity, {
    description: 'Сущность "Статус описи"',
  })
  Status: Promise<DocPackageStatusEntity>;

  @Column({ comment: "Автор" })
  @Field(() => Int, { description: "Автор" })
  author_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id)
  @JoinColumn({ name: "author_id" })
  @Field(() => EmpEntity, {
    description: "Автор",
  })
  Author: Promise<EmpEntity>;

  @OneToMany(() => DocPackageEntity, (docPackage) => docPackage.Inventory)
  @Field(() => [DocPackageEntity], {
    nullable: true,
    description: "Дела",
  })
  DocPackages: Promise<DocPackageEntity[]>;

  /********************************************
   * Файл описи (файловый блок)
   ********************************************/
  @OneToOne(() => FileBlockEntity, (item) => item.Inventory, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @Field(() => FileBlockEntity, {
    nullable: true,
    description: "Файл описи (файловый блок)",
  })
  FileBlock: Promise<FileBlockEntity>;

  @Column({ default: true, comment: "Временная запись" })
  temp: boolean;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;
}
