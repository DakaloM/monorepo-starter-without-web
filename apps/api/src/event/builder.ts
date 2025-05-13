import { createBuilder } from '@repo/datakit';
import { faker } from '@repo/testkit';

import { Event, EventAction } from './event';

export const eventsBuilder = createBuilder((attrs: Partial<Event<any>>, _factory, ctx) => {
  return Event.fromJson({
    action: EventAction.Create,
    description: faker.word.words({ count: 10 }),
    confidential: false,
    ...attrs,
  });
});
