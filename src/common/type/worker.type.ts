import { Field, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class WorkerType {
  @Field({ nullable: true })
  ct: string;

  @Field({ nullable: true })
  de: string;
  @Field({ nullable: true })
  del: number;
  @Field({ nullable: true })
  id: number;
  @Field({ nullable: true })
  isAut: number;
  @Field({ nullable: true })
  isExec: number;
  @Field({ nullable: true })
  isSign: number;
  @Field({ nullable: true })
  post: number;
  @Field({ nullable: true })
  postnm: string;
  @Field({ nullable: true })
  staff: number;
  @Field({ nullable: true })
  staffdob: number;
  @Field({ nullable: true })
  staffemail: string;
  @Field({ nullable: true })
  staffnm: string;
  // @Field({ nullable: true })
  // staffphm: string;
  @Field({ nullable: true })
  staffphone: string;
  @Field({ nullable: true })
  tdoc: number;
  @Field({ nullable: true })
  tdocnm: number;
  @Field({ nullable: true })
  unit: number;
  @Field({ nullable: true })
  unitnm: string;
}

@InputType()
export class TypeWorkerinput {
  @Field({ nullable: false })
  ln: string;
  @Field({ nullable: true })
  cd: string;
  @Field({ nullable: true })
  del: boolean;
  @Field({ nullable: true })
  dob: Date;
  @Field({ nullable: true })
  dtc: Date;
  @Field({ nullable: true })
  eml: string;
  @Field({ nullable: true })
  fw: string;
  @Field({ nullable: true })
  mn: string;
  @Field({ nullable: true })
  nm: string;
  @Field({ nullable: true })
  phim: string;
  @Field({ nullable: true })
  phone: string;
  // @Field({ nullable: true })
  // phw: string;
  @Field({ nullable: true })
  temp: boolean;
}
