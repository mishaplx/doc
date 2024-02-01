import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { GraphQLString } from "graphql";
import {
  AfterLoad,
  Check,
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
import { docPackageStatusArr } from "../../../database/seed/data/default/pack/docPackageStatus";
import { ActEntity } from "../act/act.entity";
import { DocEntity } from "../doc/doc.entity";
import { DocPackageStatusEntity } from "../docPackageStatus/docPackageStatus.entity";
import { InventoryEntity } from "../inventory/inventory.entity";
import { NomenclaturesEntity } from "../nomenclatures/nomenclatures.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";
import { DocPackageStatus } from "../../../common/enum/enum";

@ObjectType({ description: "Дела" })
@Entity({ name: "doc_package", schema: "sad" })
@Index(["nomenclature_id"], { unique: true, where: "del = false" })
@Check(`
  ("inventory_id" ISNULL AND "act_id" ISNULL)
  OR ("inventory_id" NOTNULL AND "act_id" ISNULL)
  OR ("inventory_id" ISNULL AND "act_id" NOTNULL)
`)
export class DocPackageEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn({ comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, { description: "Дата создания" })
  dtc: Date;

  @Column({ comment: "Номенклатура" })
  @Field(() => Int, { description: "Номенклатура" })
  nomenclature_id: number;

  @ManyToOne(() => NomenclaturesEntity, (nmncl) => nmncl.id)
  @JoinColumn({ name: "nomenclature_id" })
  @Field(() => NomenclaturesEntity, {
    description: 'Сущность "Номенклатура"',
  })
  Nomenclature: Promise<NomenclaturesEntity>;

  @Column({ comment: "Статус", default: DocPackageStatus.NEW })
  @Field(() => Int, { description: "Статус" })
  status_id: number;

  @ManyToOne(() => DocPackageStatusEntity, (status) => status.id)
  @JoinColumn({ name: "status_id" })
  @Field(() => DocPackageStatusEntity, {
    description: 'Сущность "Статус дела"',
  })
  Status: Promise<DocPackageStatusEntity>;

  @Column({ nullable: true, comment: "Опись" })
  @Field(() => Int, { nullable: true, description: "Опись" })
  inventory_id: number;

  @ManyToOne(() => InventoryEntity, (inventory) => inventory.id)
  @JoinColumn({ name: "inventory_id" })
  Inventory: Promise<InventoryEntity>;

  @Field({ nullable: true, description: "Опись" })
  inventory_name: string;

  @AfterLoad()
  async setComputed(): Promise<void> {
    const inventory = await this.Inventory;
    this.inventory_name = inventory
      ? `№ ${inventory?.number} за ${inventory?.year} ${(await inventory?.Name)?.nm}`
      : null;
  }

  @Column({ nullable: true, comment: "Акт" })
  @Field(() => Int, { nullable: true, description: "Акт" })
  act_id: number;

  @ManyToOne(() => ActEntity, (act) => act.id)
  @JoinColumn({ name: "act_id" })
  Act: Promise<ActEntity>;

  @OneToMany(() => DocEntity, (doc) => doc.DocPackage)
  Docs: Promise<DocEntity[]>;

  @Column({ nullable: true, comment: "Начальная дата документов", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Начальная дата документов" })
  start_date: Date;

  @Column({ nullable: true, comment: "Конечная дата документов", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Конечная дата документов" })
  end_date: Date;

  @Column({ comment: "Количество документов", default: 0 })
  @Field(() => Int, { description: "Количество документов" })
  count_doc: number;

  @Column({ comment: "Количество файлов", default: 0 })
  @Field(() => Int, { description: "Количество файлов" })
  count_file: number;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;

  /********************************************
   * Файл описи (файловый блок)
   ********************************************/
  @OneToOne(() => FileBlockEntity, (item) => item.DocPackage, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @Field(() => FileBlockEntity, {
    nullable: true,
    description: "Дело (внутренняя опись, файловый блок)",
  })
  FileBlock: Promise<FileBlockEntity>;
}
