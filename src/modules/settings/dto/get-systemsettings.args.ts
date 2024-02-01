import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetSystemSettingsArgs {
  @Field({ nullable: true, description: "Описание" })
  description?: string;

  @Field({ nullable: true, description: "Значение" })
  value?: string;

  @Field({ nullable: true, description: "настройки smd" })
  smd: boolean;
  @Field({ nullable: true, description: "настройки общие" })
  common: boolean;
  @Field({ nullable: true, description: "настройки доп." })
  extra: boolean;
}
