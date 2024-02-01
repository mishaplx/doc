import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AuditOperationTypeEntity } from "./audit-operation-type.entity";

@ObjectType({ description: "Операции аудита" })
@Entity({ name: "audit_operations", schema: "sad" })
export class AuditOperationsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /** Тип сообщения */
  @Column({ nullable: true, comment: "Тип сообщения", default: 1 })
  @Field({ nullable: true, description: "Тип сообщения" })
  type: number;

  @ManyToOne(() => AuditOperationTypeEntity, (audit_operation_type) => audit_operation_type.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "type", foreignKeyConstraintName: "type_FK" })
  @Field(() => AuditOperationTypeEntity, {
    nullable: true,
    description: "AuditOperationType",
  })
  AuditOperationType: Promise<AuditOperationTypeEntity>;

  /** Событие */
  @Column({ nullable: true, type: "text", comment: "Наименование" })
  @Field({ nullable: true, description: "Наименование" })
  name: string;

  /** Название метода */
  @Column({ nullable: true, type: "text", comment: "Название метода" })
  @Field({ nullable: true, description: "Название метода" })
  method: string;

  /** Включение */
  @Column({ nullable: true, comment: "Включение" })
  @Field({ nullable: true, description: "Признак включения" })
  is_enabled: boolean;
}
