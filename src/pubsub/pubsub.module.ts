import { Global, Module, Scope } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

import "./pubsub.constants";
import { ResolverPubSub } from "./pubsub.resolver";
import { PubSubService } from "./pubsub.service";
import { PUB_SUB } from "./pubsub.symbols";

const pubsubFactory = {
  provide: PUB_SUB,
  scope: Scope.TRANSIENT,
  useValue: new PubSub(),
};

@Global()
@Module({
  providers: [pubsubFactory, ResolverPubSub, PubSubService],
  exports: [PUB_SUB, PubSubService],
})
export class PubsubModule {}
