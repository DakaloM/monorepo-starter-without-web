// @ts-nocheck
import { Model } from 'objection';
import { DBErrors } from '~/errors';
import { FilterConfig } from '~/filter';
import { PaginationConfig } from '~/pagination';
import { SortConfig } from '~/sort';

const DBModel = DBErrors(Model);
/**
 * Abstract class that is implement by all models.
 */
export abstract class BaseModel extends DBModel {
  /**
   *  The timestamp of when the model was created.
   */
  createdAt: Date;
  /**
   * The timestamp of when the model was last updated.
   */
  updatedAt: Date;
  /**
   * An identifier that represents the root type.
   */
  static typeIdentifier: string;
  /**
   * Returns the configuration that is available for sorting through the
   * public API.
   */
  static get sortConfig(): SortConfig | null {
    return null;
  }

  /**
   * Returns the configuration that is available for filtering through the
   * public API.
   */
  static get filterConfig(): FilterConfig | null {
    return null;
  }

  /**
   * Returns the configuration that is available for pagination through the
   * public API.
   */
  static get paginationConfig(): PaginationConfig {
    const sort = this.sortConfig;
    return {
      idColumn: this.idColumn,
      limit: { max: 100, defaultValue: 100 },
      sort: sort ? sort.fields : undefined,
    };
  }

  /**
   * Returns information about the type of this model.
   */
  $typeInfo(): TypeInfo {
    const identifier = this.$modelClass.typeIdentifier;

    return { identifier };
  }
}

type TypeInfo = {
  identifier: string;
};

export type BaseModelInstance = BaseModel & { id: string };
