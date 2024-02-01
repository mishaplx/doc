import { IWhereFindAll } from "./directories.interface";

export interface IWhereFindAllOrg extends IWhereFindAll {
  fnm?: any;
  nm?: any;
  region?: number;
  adress?: any;
  phone?: any;
  fax?: any;
  email?: any;
  SmdoAbonent?: { abbreviatedName: any };
}
