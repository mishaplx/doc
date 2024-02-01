import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { OperationEntity } from "./operation.entity";
import { RolesEntity } from "./role.entity";

@ObjectType({ description: "Операции роли пользователя" })
@Entity({ name: "role_operations", schema: "sad" })
@Unique(["role_id", "operation_id"])
export class RoleOperationsEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "Роль" })
  @Field(() => Int, { description: "Id роли" })
  role_id: number;

  @ManyToOne(() => RolesEntity, (role) => role.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "role_id" })
  @Field(() => RolesEntity, { description: 'Сущность "Роль пользователя"' })
  Role: Promise<RolesEntity>;

  @Column({ comment: "Операция" })
  @Field(() => Int, { description: "Id операции" })
  operation_id: number;

  @ManyToOne(() => OperationEntity, (operation) => operation.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "operation_id" })
  @Field(() => OperationEntity, { description: 'Сущность "Операция"' })
  Operation: Promise<OperationEntity>;
}
