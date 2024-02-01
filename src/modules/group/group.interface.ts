import { Field, Int, ObjectType } from "@nestjs/graphql";
export interface InterfaceGroupeItemUser {
  code: string;

  idemp: number;

  post: string;

  staff_fio: string;

  personnal_number: string;
}

export interface IresponseGetGroupe {
  id: number;
  unit: string;
  groupName: string;
  user: IuserIntoPost[] | [];
}
export interface IresponseGetGroupeAll {
  id: number;
  groupName: string;
  unit: string;
  user: IuserIntoPost[] | [];
}

export interface IuserIntoPost {
  staff_fio: string;
  code: string;
  post: string;
  idemp: number;
  personnal_number: string;
}
@ObjectType()
export class GroupeItemUser implements InterfaceGroupeItemUser {
  @Field({
    nullable: true,
  })
  staff_fio: string;

  @Field({
    nullable: true,
  })
  code: string;

  @Field({
    nullable: true,
  })
  post: string;

  @Field({
    nullable: true,
  })
  personnal_number: string;

  @Field(() => Int, {
    nullable: true,
  })
  idemp: number;
}
@ObjectType()
export class resposneGetGroupe implements IresponseGetGroupeAll {
  @Field(() => Int, {
    nullable: true,
    defaultValue: "",
  })
  id: number;

  @Field({
    nullable: true,
    defaultValue: "",
  })
  groupName: string;

  @Field({
    nullable: true,
    defaultValue: "",
  })
  unit: string;

  @Field({
    nullable: true,
    defaultValue: "",
  })
  personnal_number: string;

  @Field(() => [GroupeItemUser], {
    nullable: true,
  })
  user: GroupeItemUser[];
}
