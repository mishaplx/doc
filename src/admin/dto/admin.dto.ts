import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Transform, TransformFnParams } from "class-transformer";
import { MaxLength, MinLength } from "class-validator";
export interface IAdminDto {
  nameOrg: string;
  nameDb: string;
  loginAdmin: string;
  passwordAdmin: string;
}
@InputType()
export class inputAdminDto implements IAdminDto {
  @Transform(({ value }: TransformFnParams) => value.toLowerCase())
  @MaxLength(200)
  @MinLength(5)
  @Field(() => String)
  loginAdmin: string;

  @MaxLength(200)
  @Field(() => String)
  nameOrg: string;

  @MaxLength(200)
  @MinLength(5)
  @Field(() => String)
  passwordAdmin: string;

  @Field(() => String)
  @Transform(({ value }: TransformFnParams) => value.toLowerCase())
  nameDb: string;
}
export interface responseAdminApi {
  success: boolean;
  error: string;
}
@ObjectType()
export class responseAdmin implements responseAdminApi {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  error: string;
}
