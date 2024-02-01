import { ObjectType } from "@nestjs/graphql";
import { ReceiverEntity } from "../../../entity/#organization/receiver/receiver.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedReceiverResponse extends PaginatedResponse(ReceiverEntity) {}
