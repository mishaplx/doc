import { EntityManager } from "typeorm";

import { Admin_abonentsEntity } from "../../entity/#adminBase/admin_abonents/admin_abonents.entity";

export type GetUserEntity = {
  abonentsEntity: Admin_abonentsEntity;
  manager?: EntityManager;
  org: string;
};
