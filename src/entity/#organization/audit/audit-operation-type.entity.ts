import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Типы операций аудита" })
@Entity({ name: "audit_operation_type", schema: "sad" })
export class AuditOperationTypeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /** Событие */
  @Column({ nullable: true, type: "text", comment: "Наименование" })
  @Field({ nullable: true, description: "Наименование" })
  name: string;
}
