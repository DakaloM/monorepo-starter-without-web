import { createEmailClient } from '@repo/emailkit';
import { config } from '~/config';

export const mailer = createEmailClient(config.mail);
