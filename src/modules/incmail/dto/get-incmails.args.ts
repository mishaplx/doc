import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetIncmailArgs {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true, description: "От." })
  sender?: string;

  @Field({ nullable: true, description: "Тема." })
  subject?: string;

  @Field({ nullable: true, description: "Дата." })
  dt?: Date;
}
