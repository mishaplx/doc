import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmpEntity } from "../emp/emp.entity";

@ObjectType({
  description: "тип поручения",
})
@Entity({ name: "type_job", schema: "sad" })
export class TypeJobEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ comment: "название" })
  @Field({ nullable: true, description: "название" })
  nm: string;

  @CreateDateColumn({
    nullable: false,
    comment: "Дата создания",
  })
  @Field({ nullable: true })
  dtc: Date;

  @Column({ comment: "Флаг удаления" })
  @Field({ nullable: true, defaultValue: false, description: "Флаг удаления" })
  del: boolean;

  @Column({ comment: "Флаг временной записи" })
  @Field({ nullable: false, defaultValue: false, description: "Флаг временной записи" })
  temp: boolean;

  @Column({ nullable: true, comment: "Автор по умолчанию" })
  @Field(() => Int, { nullable: true, description: "Id автора по умолчанию" })
  default_emp_id?: number;

  @Column({ nullable: true, comment: "Наименование автора по умолчанию", type: "text" })
  @Field({ description: "Наименование автора по умолчанию" })
  default_emp?: string;

  @ManyToOne(() => EmpEntity, (emp) => emp.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "default_emp_id",
    foreignKeyConstraintName: "default_emp_id_FL",
  })
  @Field(() => EmpEntity, { nullable: true, description: "Автор по умолчанию" })
  DefaultEmp?: Promise<EmpEntity>;
}
