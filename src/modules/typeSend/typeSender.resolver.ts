import { Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { DeliveryEntity } from "../../entity/#organization/delivery/delivery.entity";
import { TypeSendService } from "./typeSend.service";

@UseGuards(DeactivateGuard)
@Resolver(() => DeliveryEntity)
export class TypeSenderResolver {
  constructor(private typeSenderServ: TypeSendService) {}

  @Query(() => [DeliveryEntity])
  //@UseGuards(JwtAuthGuard)
  async getAllTypeSender(): Promise<DeliveryEntity[]> {
    return await this.typeSenderServ.getAllTypeSender();
  }
}
