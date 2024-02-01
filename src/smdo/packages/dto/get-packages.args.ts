import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetPackagesArgs {
  @Field({ nullable: true, description: "Тип" })
  type?: string;

  @Field({ nullable: true, description: "Статус пакета" })
  status?: string;

  @Field({ nullable: true, description: "Тип пакета, квитанция=true" })
  ack?: boolean;

  @Field({ nullable: true, description: "Тип квитанции" })
  ackType?: string;

  @Field({ nullable: true, description: "ID Документа" })
  docId?: number;

  @Field({ nullable: true, description: "ID Родительского пакета" })
  smdoParentId?: string;

  @Field({ nullable: true, description: "ID Абонента" })
  abonentSmdoId?: string;

  @Field({ nullable: true, description: "ID Абонента" })
  searchField?: string;
}
