/* eslint-disable no-restricted-imports */
import SchemaBuilder from '@pothos/core';
import WithInputPlugin from '@pothos/plugin-with-input';
import { Context } from '~/context';

import ShieldPlugin from './plugins/shield';

export interface SchemaTypes {
  Context: Context;
  Interfaces: {
    HasAssignees: { id: string };
    HasTags: { id: string };
    HasNotes: { id: string };
    HasAttachments: { id: string };
    HasEvents: { id: string };
    HasTasks: { id: string };
  };
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
    EmailAddress: {
      Input: string;
      Output: string;
    };
    JSON: {
      Input: unknown;
      Output: unknown;
    };
  };
}

export const builder = new SchemaBuilder<SchemaTypes>({
  plugins: [ShieldPlugin, WithInputPlugin],
});

builder.queryType({});
builder.mutationType({});
