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
import { ActStatus } from "../../../common/enum/enum";
import { ActStatusEntity } from "../actStatus/actStatus.entity";
import { DocPackageEntity } from "../docPackage/docPackage.entity";
import { DocPackageDeletedEntity } from "../docPackageDeleted/docPackageDeleted.entity";
import { EmpEntity } from "../emp/emp.entity";
import { FileBlockEntity } from "../file/fileBlock.entity";

@ObjectType({ description: "Акты" })
@Entity({ name: "act", schema: "sad" })
@Index(["number"], { unique: true, where: "del = false AND temp = false" })
export class ActEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn({ comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, { description: "Дата создания" })
  dtc: Date;

  @Column({ nullable: true, comment: "№ Акта", length: 100 })
  @Field({ nullable: true, description: "№ Акта" })
  number: string;

  @Column({ nullable: true, comment: "Основание", length: 300 })
  @Field({ nullable: true, description: "Основание" })
  basis: string;

  @Column({ nullable: true, comment: "№ ЭМК", length: 100 })
  @Field({ nullable: true, description: "№ ЭМК" })
  number_emk: string;

  @Column({ nullable: true, comment: "Дата ЭМК", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Дата ЭМК" })
  date_emk: Date;

  @Column({ nullable: true, comment: "Начальная дата документов", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Начальная дата документов" })
  start_date: Date;

  @Column({ nullable: true, comment: "Конечная дата документов", type: "date" })
  @Field(() => GraphQLString, { nullable: true, description: "Конечная дата документов" })
  end_date: Date;

  @Column({ comment: "Количество дел", default: 0 })
  @Field(() => Int, { description: "Количество дел" })
  count_doc_package: number;

  @Column({ comment: "Количество документов", default: 0 })
  @Field(() => Int, { description: "Количество документов" })
  count_doc: number;

  @Column({ comment: "Количество файлов", default: 0 })
  @Field(() => Int, { description: "Количество файлов" })
  count_file: number;

  @Column({ comment: "Статус", default: ActStatus.NEW })
  @Field(() => Int, { description: "Статус" })
  status_id: number;

  @ManyToOne(() => ActStatusEntity, (status) => status.id)
  @JoinColumn({ name: "status_id" })
  @Field(() => ActStatusEntity, {
    description: 'Сущность "Статус акта"',
  })
  Status: Promise<ActStatusEntity>;

  @Column({ comment: "Автор" })
  @Field(() => Int, { description: "Автор" })
  author_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id)
  @JoinColumn({ name: "author_id" })
  @Field(() => EmpEntity, {
    description: "Автор",
  })
  Author: Promise<EmpEntity>;

  @Column({
    nullable: true,
    comment: "Данные уничтожившего дела (кто нажал кнопку «Удалить дела по акту»)",
  })
  @Field(() => Int, {
    description: "Данные уничтожившего дела (кто нажал кнопку «Удалить дела по акту»)",
  })
  delete_doc_package_user_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id)
  @JoinColumn({ name: "delete_doc_package_user_id" })
  @Field(() => EmpEntity, {
    nullable: true,
    description: "Данные уничтожившего дела (кто нажал кнопку «Удалить дела по акту»)",
  })
  DeleteDocPackageUser: Promise<EmpEntity>;

  @Column({
    type: "timestamp",
    nullable: true,
    comment: "Дата и время уничтожения дел",
  })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата и время уничтожения дел",
  })
  date_delete_doc_package: Date;

  @OneToMany(() => DocPackageEntity, (docPackage) => docPackage.Act)
  @Field(() => [DocPackageEntity], {
    nullable: true,
    description: "Дела",
  })
  DocPackages: Promise<DocPackageEntity[]>;

  @OneToMany(() => DocPackageDeletedEntity, (docPackage) => docPackage.Act)
  @Field(() => [DocPackageDeletedEntity], {
    nullable: true,
    description: "Удалённые дела",
  })
  DocPackagesDeleted: Promise<DocPackageDeletedEntity[]>;

  @Column({ default: true, comment: "Временная запись" })
  temp: boolean;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;

  /********************************************
   * Файл описи (файловый блок)
   ********************************************/
  @OneToOne(() => FileBlockEntity, (item) => item.Act, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @Field(() => FileBlockEntity, {
    nullable: true,
    description: "Акт (файловый блок)",
  })
  FileBlock: Promise<FileBlockEntity>;
}
