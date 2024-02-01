import { PickType } from "@nestjs/graphql";
import { JobStatus } from "../../../../../BACK_SYNC_FRONT/enum/enum.job";
import { JobStatusesEntity } from "../../../../../entity/#organization/job/jobStatus.entity";

class JobStatusesSeed extends PickType(JobStatusesEntity, ["id", "del", "nm"] as const) {}

export const job_statusesArr: JobStatusesSeed[] = [
  {
    id: JobStatus.IN_PROGRESS,
    del: false,
    nm: "В работе",
  },
  {
    id: JobStatus.ON_APPROVAL,
    del: false,
    nm: "На утверждении",
  },
  {
    id: JobStatus.ON_REWORK,
    del: false,
    nm: "На доработке",
  },
  {
    id: JobStatus.APPROVED,
    del: false,
    nm: "Утверждено",
  },
  // {
  //   id: JobStatus.SENT_FOR_EXECUTION,
  //   del: false,
  //   nm: 'Направлено на исполнение',
  // },
  {
    id: JobStatus.ON_EXECUTION,
    del: false,
    nm: "На исполнении",
  },
  {
    id: JobStatus.FULFILLED,
    del: false,
    nm: "Исполнено",
  },
  {
    id: JobStatus.ON_PRECONTROL,
    del: false,
    nm: "На предконтроле",
  },
  {
    id: JobStatus.ON_CONTROL,
    del: false,
    nm: "На контроле",
  },
  {
    id: JobStatus.RETURNED_FOR_EXECUTION,
    del: false,
    nm: "Возвращено на исполнение",
  },
  {
    id: JobStatus.CLOSED,
    del: false,
    nm: "Закрыто",
  },
];
