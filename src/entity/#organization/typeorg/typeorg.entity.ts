import { Field, GraphQLISODateTime, Int, ObjectType } from "@nestjs/graphql";
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType({ description: "Тип организации" })
@Entity({ name: "typeorg", schema: "sad" })
@Check(`"parent_typeorg" <> "id"`)
export class TypeOrgEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  @Column({ nullable: true, comment: "Наименование", type: "text" })
  @Field({ nullable: true, description: "Наименование" })
  nm: string;

  @CreateDateColumn({ nullable: true, comment: "Дата создания" })
  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: "Дата создания",
  })
  dtc: Date;

  @Column({ nullable: true, default: false, comment: "Флаг удаления" })
  @Field({ nullable: true, description: "Флаг удаления" })
  del: boolean;

  @Column({ nullable: true, comment: "Вышестоящий тип организации" })
  @Field(() => Int, {
    nullable: true,
    description: "Вышестоящий тип организации",
  })
  parent_typeorg: number;

  @ManyToOne(() => TypeOrgEntity, (typeOrg) => typeOrg.id, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "parent_typeorg", foreignKeyConstraintName: "sup_fk" })
  @Field(() => TypeOrgEntity, {
    nullable: true,
    description: "Сущность Вышестоящий тип организации",
  })
  ParentTypeOrg: TypeOrgEntity;
}
