import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmpEntity } from "../emp/emp.entity";
import { StaffEntity } from "../staff/staff.entity";
import { UserSessionEntity } from "./userSession.entity";

@ObjectType()
@Entity({ name: "users", schema: "sad" })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn({ nullable: true, comment: "Дата создания пользователя" })
  @Field({ description: "дата создания пользователя" })
  dtc: Date;

  @Column()
  @Field({ description: "Логин пользователя" })
  username: string;

  @Column({ nullable: true, comment: "Соль" })
  salt: string;

  @Column({ comment: "Пароль" })
  password: string;

  @Column({
    nullable: false,
    default: false,
    comment: "признак: пользователь удален",
  })
  del: boolean;

  @Column({ nullable: true, comment: "ссылка на таблице emp" })
  @Field({ nullable: true, description: "ссылка на таблице emp" })
  current_emp_id: number;

  @OneToMany(() => EmpEntity, (emp) => emp.user_id, { nullable: true })
  @JoinColumn()
  @Field(() => [EmpEntity], { nullable: true })
  Emp: EmpEntity[];

  /********************************************
   * Признак: пользователь заблокирован
   ********************************************/
  @Column({
    nullable: true,
    default: false,
    comment: "Признак: пользователь заблокирован",
  })
  @Field({
    nullable: true,
    defaultValue: false,
    description: "Признак: пользователь заблокирован",
  })
  isblocked: boolean;

  @Column({ nullable: true, comment: "id в таблице admin_abonents" })
  main_id: number;

  @Field(() => StaffEntity, { nullable: true })
  @OneToOne(() => StaffEntity || null, (staff) => staff.user_id, {
    lazy: true,
  })
  @JoinColumn({
    name: "user_id",
    foreignKeyConstraintName: "staff_id_FK",
  })
  Staff: Promise<StaffEntity>;

  /********************************************
   * Сессии пользователя: объекты
   ********************************************/
  @OneToMany(() => UserSessionEntity, (item) => item.User, {
    nullable: true,
    cascade: true,
  })
  @Field(() => [UserSessionEntity], {
    nullable: true,
    description: "Сессии пользователя: объекты",
  })
  UserSessions: Promise<UserSessionEntity[]>;

  /********************************************
   * Признак: пользователя нельзя активировать
   ********************************************/
  @Column({
    nullable: true,
    default: false,
    comment: "Признак: пользователя нельзя активировать",
  })
  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: "Признак: пользователя нельзя активировать",
  })
  no_more_activate: boolean;

  /********************************************
   * Дата последнего входа в систему (даже если сесии уже нет)
   ********************************************/
  @Column({
    nullable: true,
    comment: "Дата последнего входа в систему",
  })
  @Field({
    nullable: true,
    description: "Дата последнего входа в систему",
  })
  date_auth_success: Date;

  /********************************************
   * Дата последней неверной попытки ввода пароля
   ********************************************/
  @Column({
    nullable: true,
    comment: "Дата последней неверной попытки ввода пароля",
  })
  @Field({
    nullable: true,
    description: "Дата последней неверной попытки ввода пароля",
  })
  date_auth_wrong: Date;

  /********************************************
   * Количество неверных попыток ввода пароля
   ********************************************/
  @Column({
    nullable: false,
    default: 0,
    comment: "Количество неверных попыток ввода пароля",
  })
  @Field({
    nullable: false,
    defaultValue: 0,
    description: "Количество неверных попыток ввода пароля",
  })
  count_auth_wrong: number;

}
