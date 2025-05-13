import { Cache } from '@repo/cache';
import { BaseModel } from '@repo/datakit';
import { EmailClient } from '@repo/emailkit';
import { InternalError } from '@repo/serverkit';
import { StorageClient } from '@repo/storage';
import { Knex } from 'knex';
import crypto from 'node:crypto';
import { LocalSequence } from '~/domain/sequence';
import { EventArgs, createEvent } from '~/event/mutation';

import { AuthContext } from './auth';
import { Loaders, createLoaders } from './loaders';
import { TypeIdentifier } from './type';

export class Context {
  public loaders: Loaders;
  public id: string;
  public db: Knex;
  public readonly cache: Cache;
  public auth: AuthContext;
  public readonly mailer: EmailClient;
  public readonly storageClient: StorageClient;
  private sequencer: LocalSequence;

  static init(options: ContextInitOptions) {
    const ctx = new Context(options);
    ctx.loaders = createLoaders(ctx);
    ctx.sequencer = new LocalSequence(ctx);
    return ctx;
  }

  async bumpSequenceValue(refId: string, type: TypeIdentifier, trx?: Knex) {
    const exists = await this.sequencer.exists(refId, type, trx);

    if (!exists) {
      await this.sequencer.createSequence(refId, type, trx);
    }

    return this.sequencer.bumpSequenceValue(refId, type, trx);
  }

  async createSequence(refId: string, type: TypeIdentifier | TypeIdentifier[], trx?: Knex) {
    return this.sequencer.create(refId, type, trx);
  }

  private constructor(options: ContextInitOptions) {
    Object.assign(this, options);
    this.id = options.id || crypto.randomUUID();
    this.auth = options.auth || new AuthContext();
  }

  async createEvent<TEvent>(args: EventArgs<TEvent> | EventArgs<TEvent>[], trx?: Knex) {
    const db = trx || this.db;
    const events = Array.isArray(args) ? args : [args];

    await createEvent(events, this, db);
  }

  async resolveType(model: BaseModel | TypeIdentifier) {
    const identifier = typeof model === 'string' ? model : model.$typeInfo().identifier;

    const type = await this.loaders.types.byIdentifier.load(identifier);

    if (!type) {
      return null;
    }

    return type;
  }

  /**
   * Sames as `resolveType` but throws an exception if the type does not exist.
   */
  async resolveTypeAssert(model: BaseModel | TypeIdentifier) {
    const type = await this.resolveType(model);

    if (!type) {
      throw new InternalError({ message: 'Unable to resolve type.' });
    }

    return type;
  }
}

interface ContextInitOptions {
  id?: string;
  db: Knex;
  cache: Cache;
  auth?: AuthContext;
  mailer: EmailClient;
  storageClient: StorageClient;
}
