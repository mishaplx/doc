import { PickType } from "@nestjs/graphql";
import { DocStatus } from "../../../../../modules/doc/doc.const";
import { DocStatusEntity } from "../../../../../entity/#organization/docstatus/docStatus.entity";

class DocStatusSeed extends PickType(DocStatusEntity, [
  "id",
  "temp",
  "del",
  "isstart",
  "nm",
] as const) {}

export const docStatusArr: DocStatusSeed[] = [
  {
    id: DocStatus.NEWDOC.id,
    nm: DocStatus.NEWDOC.nm,
    isstart: true,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.INREGISTRATE.id,
    nm: DocStatus.INREGISTRATE.nm,
    isstart: false,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.REGISTRATE.id,
    nm: DocStatus.REGISTRATE.nm,
    isstart: false,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.INVIEW.id,
    nm: DocStatus.INVIEW.nm,
    isstart: false,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.INDO.id,
    nm: DocStatus.INDO.nm,
    isstart: false,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.DONE.id,
    nm: DocStatus.DONE.nm,
    isstart: false,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.INWORK.id,
    nm: DocStatus.INWORK.nm,
    isstart: false,
    del: false,
    temp: false,
  },
  {
    id: DocStatus.NOTREGISTER.id,
    nm: DocStatus.NOTREGISTER.nm,
    isstart: false,
    del: false,
    temp: false,
  },
];
