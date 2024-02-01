import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmpEntity } from '../emp/emp.entity';
import { EmpReplaceEntity } from '../emp_replace/emp_replace.entity';
import { UserEntity } from '../user/user.entity';

@ObjectType()
@Entity({ name: 'users_all_emp', schema: 'sad' })
export class UserAllEmpEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn({ nullable: true, comment: 'Дата создания пользователя' })
  @Field({ description: 'дата создания пользователя' })
  dtc: Date;

  @Column()
  user: number;

  @Column({
    nullable: true,
  })
  emp: number | null;

  @Column({
    nullable: true,
  })
  replaceEmp: number | null;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user', foreignKeyConstraintName: 'user_Fk' })
  userEntity: Promise<UserEntity>;

  @ManyToOne(() => EmpEntity, (emp) => emp.id)
  @JoinColumn({ name: 'emp', foreignKeyConstraintName: 'emp_Fk' })
  empEntity: Promise<EmpEntity>;

  @ManyToOne(() => EmpReplaceEntity, (emp) => emp.id, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'replaceEmp', foreignKeyConstraintName: 'empReplace_userAllEmp_Fk' })
  replaceEmpEntity: Promise<EmpReplaceEntity>;
}
