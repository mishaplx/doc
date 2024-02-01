import { Readable } from "node:stream";

export interface IWhereAllDocuments {
  del?: boolean;
  temp?: boolean;
  cls_id?: number;
  docstatus?: any;
  author?: number;
  Author?: any;
  body?: any;
  reg_num?: any;
  tdoc?: number;
  dr?: Date;
  priv?: number;
  citizen?: any;
  outnum?: any;
  outd?: Date;
  signed?: any;
  nt?: any;
  Delivery?: any;
  nmncl?: number;
  Forwarding?: {
    del?: boolean;
    temp?: boolean;
    emp_receiver?: number;
    date_end_sender?: any;
  };
}

export interface IGetWhereAllDocuments {
  where: IWhereAllDocuments;
  relations: Array<string>;
}

export interface IAttachmentsForSendMail {
  stream: Readable;
  compress: boolean;
  filename: string;
  content: string;
}
