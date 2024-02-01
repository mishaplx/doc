import { Field, Int, ObjectType } from "@nestjs/graphql";

import { PostEntity } from "../../entity/#organization/post/post.entity";

export interface getEmpInterface {
  userId: number;
  posts: Promise<PostEntity>[];
}
export interface IgetAllEmpForCurrentUser {
  idEmp: number;
  idUser: number;
  idPost: number;
  postNm: string;
  selected: boolean;
  replace: boolean;
  repsonalNumber: string;
}

@ObjectType()
export class getEmp implements getEmpInterface {
  @Field(() => [PostEntity])
  posts: Promise<PostEntity>[];

  @Field(() => Int)
  userId: number;
}

@ObjectType()
export class getAllEmpForCurrentUser implements IgetAllEmpForCurrentUser {
  @Field(() => Int)
  idEmp: number;

  @Field(() => Int)
  idUser: number;

  @Field(() => Int)
  idPost: number;

  @Field(() => String)
  postNm: string;

  @Field(() => String)
  repsonalNumber: string;

  @Field(() => Boolean, { defaultValue: false })
  selected: boolean;

  @Field(() => Boolean, { defaultValue: false })
  replace: boolean;
}
