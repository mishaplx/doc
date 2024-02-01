export interface Options {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: any;
}

export interface Incmail {
  sender: string;
  email: string;
  uid: string;
  subject: string;
  body?: string;
  html?: string;
  dt: Date;
  attachments: any[];
}

export interface Source {
  uid: string;
  source: Buffer;
}
