import { Field, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { TypeDefaultFavoritesData } from "../../../modules/favorites/interface/favorite.interface";
import { EmpEntity } from "../emp/emp.entity";

@ObjectType({ description: "Избранное" })
@Entity({ name: "favorites", schema: "sad" })
export class FavoritesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id!: number;

  /** ID сотрудника */
  @Column({ nullable: true, comment: "ID сотрудника" })
  @Field(() => Int, { nullable: true, description: "ID сотрудника" })
  emp_id: number;

  /********************************************
   * Создатель: объект
   ********************************************/
  @ManyToOne(() => EmpEntity, (item) => item.id, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "emp_id",
    foreignKeyConstraintName: "report_emp_fk",
  })
  @Field(() => EmpEntity, {
    nullable: false,
    description: "Создатель: объект",
  })
  Emp: Promise<EmpEntity>;

  /**  */
  @Column({ nullable: true, type: "json", comment: "favorites" })
  @Field(() => JSON, { nullable: true, description: "Избранное" })
  favorites: TypeDefaultFavoritesData;
}
