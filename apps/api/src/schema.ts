import { builder } from '~/graphql/builder';

import '~/account/graphql';
import '~/address/graphql';
import '~/assignee/graphql';
import '~/auth/graphql';
import '~/documents/graphql';
import '~/graphql/scalars';

export const schema = builder.toSchema({});
