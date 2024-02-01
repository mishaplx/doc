import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
@ObjectType("SubActionTypeObj")
@InputType("SubActionTypeInput")
export class SubActionType {
  @Field(() => Boolean, {
    nullable: true,
  })
  cd1: boolean;
  @Field(() => Boolean, {
    nullable: true,
  })
  cd2: boolean;
  @Field(() => Boolean, {
    nullable: true,
  })
  cd3: boolean;
  @Field(() => Boolean, {
    nullable: true,
  })
  cd4: boolean;
  @Field(() => Boolean, {
    nullable: true,
  })
  cd5: boolean;
}
