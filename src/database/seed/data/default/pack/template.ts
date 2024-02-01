import { PickType } from "@nestjs/graphql";
import { TemplateEntity } from "../../../../../entity/#organization/template/template.entity";

class TemplateSeed extends PickType(TemplateEntity, [
  "id",
  "nm",
  "del",
  "temp",
  "docroute",
] as const) {}

export const templateArr: TemplateSeed[] = [
  {
    id: 1,
    nm: "-",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 2,
    nm: "До минования надобности",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 3,
    nm: "До переоценки",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 4,
    nm: "До востребования",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 5,
    nm: "До замены новыми",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 6,
    nm: "75 лет",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 7,
    nm: "50 лет",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 8,
    nm: "15 лет",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 9,
    nm: "10 лет",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 10,
    nm: "5 лет",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 11,
    nm: "3 года",
    del: false,
    temp: false,
    docroute: 1,
  },
  {
    id: 12,
    nm: "1 год",
    del: false,
    temp: false,
    docroute: 1,
  },
];
