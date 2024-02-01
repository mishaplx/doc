import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class DocStatusUpdate {
  @Field({ nullable: true })
  nm: string;

  @Field({ nullable: true })
  phase: number;

  @Field({ nullable: true })
  isstart: boolean;

  @Field({
    nullable: true,
    defaultValue: false,
  })
  del: boolean;

  @Field({
    nullable: true,
    defaultValue: false,
  })
  temp: boolean;
}
