import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { languagesI } from "../../entity/#organization/doc/doc.entity";
import { MetadataType } from "./MetadataType.type";

@ObjectType()
export class FindAllDocType {
  @Field({ nullable: true })
  addrisorg: number;

  @Field({ nullable: true })
  addrorg: number;

  @Field({ nullable: true })
  addrorgnm: string;

  @Field({ nullable: true })
  addrcitizen: number;

  @Field({ nullable: true })
  addrcitizennm: number;

  @Field({ nullable: true })
  addrnm: number;

  @Field({ nullable: true })
  addrd: string;

  @Field({ nullable: true })
  addrcopy: string;

  @Field({ nullable: true })
  addrcopynm: number;

  @Field({ nullable: true })
  addrdeliv: number;

  @Field({ nullable: true })
  addrdelivnm: number;

  @Field({ nullable: true })
  addrnt: string;

  @Field({ nullable: false })
  agreedphase: string;

  @Field({ nullable: true })
  agreedpd: number;

  @Field({ nullable: false })
  approvephase: string;

  @Field({ nullable: true })
  approvepd: number;

  @Field({ nullable: true })
  body: string;

  @Field({ nullable: false })
  cls: number;

  @Field({ nullable: false })
  clsnm: string;

  @Field(() => [String], { nullable: true })
  corrnm: [string];

  @Field({ nullable: true })
  ct: string;

  @Field({ nullable: false })
  ctrlnm: string;

  @Field({ nullable: false })
  del: number;

  @Field({ nullable: true })
  delivery: number;

  @Field({ nullable: true })
  da: Date;

  @Field({ nullable: true })
  deliverynm: string;

  @Field({
    description: 'Дата регистрации "рег. дата"',
    nullable: true,
  })
  dr: Date;

  @Field({ nullable: true })
  dp: Date;

  @Field({ nullable: true })
  execs: number;

  @Field({ nullable: true })
  exemplar: string;

  @Field({ nullable: true })
  fw: string;

  @Field({ nullable: false })
  id: number;

  @Field({ nullable: false })
  info: string;

  @Field({ nullable: false })
  lost: number;

  @Field({ nullable: false })
  meetphase: string;

  @Field({ nullable: true })
  meetpd: number;

  @Field({ nullable: true })
  nmncl: number;

  @Field({ nullable: true })
  nmnclnm: string;

  @Field({ nullable: true })
  nmr: number;

  @Field({ nullable: true })
  nmrnm: number;

  @Field({ nullable: true })
  nt: string;

  @Field({ nullable: true })
  num: string;

  @Field({ nullable: false })
  pg: string;

  @Field({ nullable: false })
  prelost: number;

  @Field({ nullable: false })
  priv: number;

  @Field({ nullable: false })
  privnm: string;

  @Field({ nullable: true })
  rectype: string;

  @Field({ nullable: true })
  tdoc: number;

  @Field({ nullable: true })
  tdocnm: string;

  @Field({ nullable: false })
  temp: number;

  @Field({ nullable: true })
  sign: number;

  @Field({ nullable: true })
  signnm: string;

  @Field({ nullable: true })
  exec: number;

  @Field({ nullable: true })
  execnm: number;

  @Field({ nullable: true })
  regnum: string;

  @Field({ nullable: true })
  org: number;

  @Field({ nullable: true })
  orgnm: number;

  @Field({ nullable: true })
  citizen_id: number;

  @Field({ nullable: true })
  citizennm: number;

  @Field({ nullable: true })
  corr: string;

  @Field({ nullable: false })
  isorg: number;

  @Field({ nullable: false })
  ctype: string;

  @Field({ nullable: true })
  pcorr: number;

  @Field({ nullable: true })
  pcorrnm: number;

  @Field({ nullable: true })
  outnum: number;

  @Field({ nullable: true })
  signed: number;

  @Field({ nullable: true })
  region: number;

  @Field({ nullable: true })
  regionnm: number;

  @Field({ nullable: true })
  recplace: number;

  @Field({ nullable: true })
  recplacenm: number;

  @Field({ nullable: true })
  outd: Date;

  @Field({ nullable: true })
  resrev: number;

  @Field({ nullable: true })
  resrevnm: number;

  @Field({ nullable: true })
  tquest: number;

  @Field({ nullable: true })
  tquestnm: number;

  @Field({ nullable: true })
  author: number;

  @Field({ nullable: true })
  authornm: number;

  @Field({ nullable: true })
  infoDoc: string;

  @Field({ nullable: true })
  fworg: number;

  @Field({ nullable: true })
  fworgnm: string;

  @Field({ nullable: true })
  fwnum: string;

  @Field({ nullable: true })
  fwauthor: string;

  @Field({ nullable: true })
  fwoutd: string;

  @Field({ nullable: true })
  onreview: number;

  @Field({ nullable: true })
  dtc: Date;

  @Field({ nullable: true })
  docroute: number;

  @Field({ nullable: true })
  docroutenm: string;

  @Field({ nullable: false })
  docstatus: number;

  @Field({ nullable: false })
  docstatusnm: string;

  @Field({ nullable: false })
  reviewphase: string;

  @Field({ nullable: true })
  reviewpd: number;

  @Field({ nullable: false })
  doitphase: string;

  @Field({ nullable: true })
  doitpd: number;

  @Field({ nullable: true })
  iswrong: number;

  @Field({ nullable: false })
  phase: number;

  @Field({ nullable: false })
  icostatus: string;

  @Field({ nullable: true })
  template: number;

  @Field({ nullable: true })
  templatenm: number;

  @Field({ nullable: false })
  filenm: string;

  @Field({ nullable: true })
  addrall: string;

  @Field({ nullable: true })
  msg: string;

  @Field(() => MetadataType)
  metadata: MetadataType;
}

@InputType()
export class DocInput {
  @Field(() => Int, { nullable: true })
  agreedphase: number;

  @Field(() => Int, { nullable: true })
  approvephase: number;

  @Field(() => Int, {
    description: "Автор",
    nullable: true,
  })
  author: number;

  @Field({
    description: "Содержание",
    nullable: true,
  })
  body: string;

  @Field({
    nullable: true,
    defaultValue: "",
    description: "Номер фирменного бланка.",
  })
  number_blank: string;

  @Field(() => Int, {
    description: "Класс документа",
    nullable: true,
  })
  cdoc: number;

  @Field(() => Int, {
    description: "id гражданина",
    nullable: true,
  })
  citizen_id: number;

  @Field(() => Int, {
    description: "Тип документа",
    nullable: true,
  })
  cls: number;

  @Field({ nullable: true })
  ctrld: Date;

  @Field(() => Int, { nullable: true })
  ctrlorg: number;

  @Field({ nullable: true })
  da: Date;

  @Field({
    description: "Флаг - запись удалена или нет",
    nullable: true,
    defaultValue: false,
  })
  del: boolean;

  @Field(() => Int, {
    description: "Тип доставки",
    nullable: true,
  })
  delivery: number;

  @Field(() => Int, {
    description: "Маршрут документа",
    nullable: true,
  })
  docroute: number;

  @Field(() => Int, {
    description: "Статус документа",
    nullable: true,
  })
  docstatus: number;

  @Field(() => Int, { nullable: true })
  doitphase: number;

  @Field({
    description: "Исполнить до (дата)",
    nullable: true,
  })
  dp: string;

  @Field({
    description: "Заголовок",
    nullable: true,
  })
  header: string;

  @Field({
    description: 'Дата регистрации "рег. дата"',
    nullable: true,
  })
  dr: Date;

  @Field(() => Int, {
    description: "Исполнитель",
    nullable: true,
  })
  exec: number;

  @Field({ nullable: true })
  filenm: string;

  @Field(() => Int, { nullable: false })
  id: number;

  @Field({ nullable: true })
  isexec: boolean;

  @Field({
    description: "Флаг - организация или физическое лицо",
    nullable: true,
  })
  isorg: boolean;

  @Field({ nullable: true })
  lost: boolean;

  @Field(() => Int, { nullable: true })
  meetphase: number;

  @Field({ nullable: true })
  msg: string;

  @Field(() => Int, {
    description: "Номенклатура",
    nullable: true,
  })
  nmncl: number;

  @Field(() => Int, { nullable: true })
  nmr: number;

  @Field({ nullable: true })
  nt: string;

  @Field({
    description: "Регистрационный номер (рег. №)",
    nullable: true,
  })
  reg_num: string;

  @Field({ nullable: true })
  onreview: boolean;

  @Field(() => Int, {
    description: "Организация",
    nullable: true,
  })
  org_id: number;

  @Field({ nullable: true })
  outd: Date;

  @Field({ nullable: true })
  outnum: string;

  @Field(() => Int, { nullable: true })
  pcorr: number;

  @Field(() => Int, { nullable: true })
  pcorrnm: number;

  @Field({
    description: "Количество листов",
    nullable: true,
  })
  pg: string;

  @Field({ nullable: true })
  prelost: boolean;

  @Field(() => Int, {
    description: "Уровень доступа",
    nullable: true,
  })
  priv: number;

  @Field(() => Int, { nullable: true })
  recplace: number;

  @Field(() => Int, { nullable: true })
  region: number;

  @Field(() => Int, { nullable: true })
  resrev: number;

  @Field(() => Int, { nullable: true })
  reviewphase: number;

  @Field(() => Int, {
    description: "Подписант",
    nullable: true,
  })
  sign: number;

  @Field({ nullable: true })
  signed: string;

  @Field({
    nullable: true,
    defaultValue: false,
  })
  temp: boolean;

  @Field(() => Int, { nullable: true })
  template: number;

  @Field(() => Int, {
    description: "Вид документа",
    nullable: true,
  })
  tdoc: number;

  @Field(() => String, { nullable: true })
  short_note: string;

  @Field({ nullable: true, defaultValue: null })
  date_send_to_doc_package: Date;

  @Field(() => Int, { nullable: true, description: "Временное дело" })
  doc_package_temp_id: number;

  @Field(() => [languagesI], { nullable: true })
  languages: [languagesI];

  @Field(() => Int, {
    nullable: true,
    defaultValue: null,
    description: "Подразделение инициатора документа (не путать с кодом подразделения unit.code)",
  })
  unit_id: number;
}
