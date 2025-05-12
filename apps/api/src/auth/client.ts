import { BaseModel } from '@num/datakit';

export enum ClientScope {
  Auth = 'za.co.num.auth',
}

export class Client extends BaseModel {
  static tableName = 'client';
  id: string;
  secret: string;
  scope: string[];
  raw: unknown;
}
