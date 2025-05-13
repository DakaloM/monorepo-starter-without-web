import { startCase } from '@repo/utils';

import { RoleIdentifier } from './role';

export const roles = Object.values(RoleIdentifier).map((identifier) => {
  const name = startCase(identifier.split('.').pop()).replace(/\s+/g, '');

  return {
    identifier,
    name,
  };
});
