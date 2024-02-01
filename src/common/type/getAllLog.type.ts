import { Field, ObjectType } from "@nestjs/graphql";
import { MetadataType } from "./MetadataType.type";

@ObjectType()
export class GetAllLogType {
  @Field({ nullable: true })
  ct: string;
  @Field({ nullable: true })
  id: number;
  @Field({ nullable: true })
  msgid: string;
  @Field({ nullable: true })
  sessionid: number;

  @Field({ nullable: true })
  msgtype: string;

  @Field({ nullable: true })
  msgtypenm: string;

  @Field({ nullable: true })
  mailtype: number;
  @Field({ nullable: true })
  mailtypenm: string;

  @Field({ nullable: true })
  guid: number;

  @Field({ nullable: true })
  status: number;
  @Field({ nullable: true })
  statusnm: string;

  @Field({ nullable: true })
  subject: string;

  @Field({ nullable: true })
  dtstamp: number;

  @Field({ nullable: true })
  dtc: string;

  @Field({ nullable: true })
  endlive: number;

  @Field({ nullable: true })
  sender: string;

  @Field({ nullable: true })
  sendernm: string;

  @Field({ nullable: true })
  receiver: number;

  @Field({ nullable: true })
  receivernm: string;

  @Field({ nullable: true })
  result: string;

  @Field({ nullable: true })
  standard: string;

  @Field({ nullable: true })
  acktype: number;

  @Field({ nullable: true })
  acktypenm: number;

  @Field({ nullable: true })
  acknow: string;

  @Field({ nullable: true })
  regnum: string;

  @Field({ nullable: true })
  regdate: string;

  @Field({ nullable: true })
  incnum: string;
  @Field({ nullable: true })
  incdate: number;

  @Field({ nullable: true })
  valid: number;
  @Field({ nullable: true })
  err: string;

  @Field({ nullable: true })
  doc: string;

  @Field({ nullable: true })
  restorenum: number;
  @Field({ nullable: true })
  idnumber: number;

  @Field({ nullable: true })
  tomsgid: number;
  @Field(() => MetadataType)
  metadata: MetadataType;
}
