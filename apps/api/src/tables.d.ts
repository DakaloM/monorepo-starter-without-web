import { User } from '~/account/user';

export module 'knex/types/tables' {
  interface Tables {
    users: User;
  }
}
