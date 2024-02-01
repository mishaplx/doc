import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { RoleOperationsEntity } from "./roleOperation.entity";

@ObjectType({ description: "Роли пользователей" })
@Entity({ name: "roles", schema: "sad" })
@Index(["name"], {
  unique: true,
  where: "(del = false) AND (temp = false)",
})
export class RolesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true, comment: "Наименование роли", type: "text" })
  @Field({ nullable: true, description: "Наименование роли" })
  name: string;

  @Column({ nullable: true, type: "text", comment: "Примечание" })
  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Column({ default: false, comment: "Запись удалена" })
  del: boolean;

  @Column({ default: false, comment: "Временная запись" })
  temp: boolean;

  @CreateDateColumn({ comment: "Дата обновления" })
  @Field(() => GraphQLISODateTime, {
    description: "Дата обновления",
  })
  updated_at: Date;

  @Column({ comment: "Редактор роли" })
  @Field(() => Int, { description: "Редактор роли" })
  editor_id: number;

  @ManyToOne(() => EmpEntity, (emp) => emp.id)
  @JoinColumn({ name: "editor_id" })
  Editor: Promise<EmpEntity>;

  @Column({ default: false, comment: "Флаг блокировки" })
  @Field({ description: "Флаг блокировки" })
  locked: boolean;

  @Column({ nullable: true, comment: "доступность пунктов меню", type: "json" })
  @Field(() => JSON, { description: "доступность пунктов меню" })
  roles_menu_ops: any;

  @OneToMany(() => RoleOperationsEntity, (roleOper) => roleOper.Role, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [RoleOperationsEntity], {
    nullable: true,
    description: "Операции по роли пользователя",
  })
  RoleOperations: RoleOperationsEntity[];
}
