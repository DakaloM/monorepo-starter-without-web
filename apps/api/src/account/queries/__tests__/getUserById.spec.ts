import crypto from 'node:crypto';
import { Context } from '~/context';
import { createContext, destroyContext } from '~/test/context';
import { Environment, createEnv, destroyEnv } from '~/test/environment';
import { Factory, createFactory } from '~/test/factory';

import { getUserById } from '../getUserById';

describe('account/queries/getUserById', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  beforeAll(async () => {
    env = await createEnv();
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  beforeEach(async () => {
    ctx = await createContext(env);
    factory = createFactory(ctx);
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('should return a user', async () => {
    const user = await factory.insert('user');

    const result = await getUserById(user.id, ctx);

    expect(result.email).toEqual(user.email);
  });

  it('should throw error when user does not exist', async () => {
    const id = crypto.randomUUID();

    await expect(getUserById(id, ctx)).rejects.toMatchSnapshot();
  });
});
