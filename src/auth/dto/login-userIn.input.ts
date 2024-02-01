import { Field, InputType } from "@nestjs/graphql";
import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty } from "class-validator";

@InputType()
export class loginUserInputIn {
  // данные по входу пользователя
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Field({ nullable: false })
  username: string;

  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Field({ nullable: false })
  password: string;
}
