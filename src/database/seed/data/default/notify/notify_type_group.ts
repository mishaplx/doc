import { PickType } from "@nestjs/graphql";

import { NotifyTypeGroupEntity } from "../../../../../entity/#organization/notify/notifyTypeGroup.entity";
import { NOTIFY_TYPE_GROUP } from "../../../../../modules/notify/notify.const";

class NotifyTypeGroupSeed extends PickType(NotifyTypeGroupEntity, ["id", "name"] as const) {}

export const notifyTypeGroupArr: NotifyTypeGroupSeed[] = [
  {
    id: NOTIFY_TYPE_GROUP.PROJECT.id,
    name: NOTIFY_TYPE_GROUP.PROJECT.nm,
  },
  {
    id: NOTIFY_TYPE_GROUP.DOC.id,
    name: NOTIFY_TYPE_GROUP.DOC.nm,
  },
  {
    id: NOTIFY_TYPE_GROUP.JOB.id,
    name: NOTIFY_TYPE_GROUP.JOB.nm,
  },
  {
    id: NOTIFY_TYPE_GROUP.SERVER.id,
    name: NOTIFY_TYPE_GROUP.SERVER.nm,
  },
  {
    id: NOTIFY_TYPE_GROUP.ANY.id,
    name: NOTIFY_TYPE_GROUP.ANY.nm,
  },
];
