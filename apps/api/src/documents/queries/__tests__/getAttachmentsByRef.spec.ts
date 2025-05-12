import { Context } from '~/context';
import { Attachment } from '~/documents/attachment';
import { createContext, destroyContext } from '~/test/context';
import { Environment, createEnv, destroyEnv } from '~/test/environment';
import { Factory, createFactory } from '~/test/factory';

describe('accounts/queries/getAttachmentsByRef', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let attachment: Attachment;

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

  it('should get tenant attachment versions', async () => {});
});
