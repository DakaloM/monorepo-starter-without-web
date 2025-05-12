import { NotFoundError } from '@num/serverkit';

import { Knex } from 'knex';
import { camelCase, uniq } from 'lodash';
import { Context } from '~/context';
import { uuidToUlid } from '~/domain/id';
import { TypeIdentifier } from '~/type';

export class LocalSequence {
  constructor(readonly ctx: Context) {}

  static getSequenceName(id: string, type: TypeIdentifier) {
    const seq = id.replace(/-/g, '');
    const name = camelCase(type);

    return `_${seq}_${name}_seq`.toLowerCase();
  }

  async exists(refId: string, type: TypeIdentifier, trx?: Knex) {
    const sequenceName = LocalSequence.getSequenceName(refId, type);

    const db = trx || this.ctx.db;

    const response = (await db('information_schema.sequences')
      .count('*')
      .where({
        sequenceName,
      })
      .first()) as Record<string, string>;

    const count = parseInt(response.count as string);

    return count !== 0;
  }

  async createSequence(refId: string, type: TypeIdentifier, trx?: Knex) {
    const sequenceName = LocalSequence.getSequenceName(refId, type);

    const db = trx || this.ctx.db;

    try {
      await db.raw(`
      CREATE SEQUENCE ${sequenceName}
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
      `);
    } catch (e) {
      throw new NotFoundError({
        message: `unable to create ${sequenceName} sequence`,
      });
    }
  }

  async create(refId: string, type: TypeIdentifier | TypeIdentifier[], trx?: Knex) {
    const types = uniq(Array.isArray(type) ? type : [type]);

    return await Promise.all(types.map((type) => this.createSequence(refId, type, trx)));
  }

  async bumpSequenceValue(refId: string, type: TypeIdentifier, trx?: Knex) {
    const sequenceName = LocalSequence.getSequenceName(refId, type);
    const db = trx || this.ctx.db;

    try {
      const [{ nextval: nextval }] = await db.select(
        this.ctx.db.raw(`nextval('${sequenceName}'::regclass);`),
      );
      return parseInt(nextval);
    } catch {
      throw new NotFoundError({
        message: `sequence for ${type}  does not exist`,
      });
    }
  }
}
