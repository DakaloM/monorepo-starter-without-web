// @ts-nocheck
import { wrapError } from 'db-errors';
import { Model } from 'objection';

export {
  CheckViolationError,
  ConstraintViolationError,
  DataError,
  ForeignKeyViolationError,
  NotNullViolationError,
  UniqueViolationError,
  DBError,
} from 'db-errors';

export { ValidationError } from 'objection';

export function DBErrors<M extends typeof Model>(ModelClass: M): M {
  return class extends ModelClass {
    constructor(...args: never[]) {
      super(...args);
    }

    static query() {
      return super.query.apply(this, arguments).onError((err) => {
        return Promise.reject(wrapError(err));
      });
    }
  };
}
