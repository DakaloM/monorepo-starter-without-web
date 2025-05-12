import { createEmailClient } from '@num/emailkit';

import { config } from '~/config';

export const mailer = createEmailClient(config.mail);
