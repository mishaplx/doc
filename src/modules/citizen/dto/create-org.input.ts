import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class createCitizenInput {
  @Field({ description: "Наименование" })
  nm!: string;

  @Field({ description: "фамилия" })
  ln!: string;

  @Field({ nullable: true, description: "Отчество" })
  mn: string;

  @Field({ description: "Адрес" })
  addr: string;

  @Field({ description: "Почта" })
  email: string;

  @Field({ description: "id региона" })
  region_id: number;
  del: boolean;
  temp: boolean;
  dtc: Date;
}
