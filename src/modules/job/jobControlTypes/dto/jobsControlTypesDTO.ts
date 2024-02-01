import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class JobsControlTypeUpdate {
  @Field({
    description: "Наименование типа контроля",
    nullable: true,
  })
  nm: string;
  @Field({
    description: "ID типа контроля",
    nullable: true,
  })
  id!: number;
  @Field({
    description: "ID контролера",
    nullable: true,
  })
  controller_id!: number;
}
