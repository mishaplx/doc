import { PickType } from "@nestjs/graphql";
import { JobsControlTypesEntity } from "../../../../../entity/#organization/job/jobControlTypes.entity";

class JobsControlTypesSeed extends PickType(JobsControlTypesEntity, ["id", "del", "nm"] as const) {}

export const jobs_control_typesArr: JobsControlTypesSeed[] = [
  {
    id: 1,
    del: false,
    nm: "Контроль",
  },
  {
    id: 2,
    del: false,
    nm: "Контроль 1",
  },
  {
    id: 3,
    del: false,
    nm: "Контроль ВО",
  },
  {
    id: 4,
    del: false,
    nm: "Контроль ОГ",
  },
];
