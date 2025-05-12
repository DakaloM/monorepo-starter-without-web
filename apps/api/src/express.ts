import { Context } from './context';

declare global {
  export namespace Express {
    export interface Request {
      ctx: Context;
    }
  }
}
