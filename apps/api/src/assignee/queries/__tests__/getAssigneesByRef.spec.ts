import { Role, RoleIdentifier } from '~/account';
import { Assignee } from '~/assignee/assignee';
import { Category, CategoryName } from '~/case/category';
import { Context } from '~/context';
import { createContext, destroyContext } from '~/test/context';
import { createEnv, destroyEnv, Environment } from '~/test/environment';
import { Factory, createFactory } from '~/test/factory';
import { Type, TypeIdentifier } from '~/type/type';

import { getAssigneesByRef } from '../getAssigneesByRef';

describe('assignees/queries/getAssigneesByRef', () => {
  let env: Environment;
  let ctx: Context;
  let factory: Factory;
  let types: Record<TypeIdentifier, Type>;
  let roles: Record<RoleIdentifier, Role>;
  let category: Category;

  beforeAll(async () => {
    env = await createEnv();
  });

  afterAll(async () => {
    await destroyEnv(env);
  });

  beforeEach(async () => {
    ctx = await createContext(env);
    factory = createFactory(ctx);

    types = await factory.seed('types');
    roles = await factory.seed('roles');
    category = await factory.insert('category');
  });

  afterEach(async () => {
    await destroyContext(ctx);
  });

  it('gets all readable assignees', async () => {
    const region = await factory.insert('region');
    const tenant = await factory.insert('tenant', { regionId: region.id });
    const users = await factory.insertMany(10, 'user', {tenantId: tenant.id});
    const numCase = await factory.insert('case', {
      assignees: users.map(
        (user) =>
          ({
            objectId: user.id,
            roleId: roles[RoleIdentifier.Assignee].id,
            refId: '#ref',
            refTypeId: types[TypeIdentifier.Case].id,
          }) as Assignee,
      ),
      categoryId: category.id,
    });

    const assignees = await getAssigneesByRef(numCase.id, ctx);

    expect(assignees).toHaveLength(10);
    const ids = assignees.map((assignee) => assignee.objectId).sort();
    expect(ids).toEqual(users.map((user) => user.id).sort());
  });
});
