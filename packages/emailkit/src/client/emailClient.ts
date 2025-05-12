import nodemailer, { SendMailOptions as BaseSendMailOptions } from 'nodemailer';
import { promisify } from 'util';

import { renderEmail, Props as EmailTemplateProps } from '../EmailTemplate';

export function createEmailClient(env: MailOptions): EmailClient {
  const auth =
    env.user && env.password
      ? {
          user: env.user,
          pass: env.password,
        }
      : undefined;
  const transporter = nodemailer.createTransport({
    host: env.host,
    port: env.port,
    secure: env.secure,
    auth,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const baseSendMail = promisify(transporter.sendMail).bind(transporter);

  return {
    sendMail: async (options: SendMailOptions) => {
      await baseSendMail({
        from: env.fromEmail,
        ...options,
        html: renderEmail(options.data),
      });
    },
  };
}

export type SendMailOptions = Omit<BaseSendMailOptions, 'text'> & {
  to: string;
  data: EmailTemplateProps;
};

export type EmailClient = {
  sendMail: (options: SendMailOptions) => Promise<void>;
};

type MailOptions = {
  host: string;
  port: number;
  fromEmail?: string;
  secure?: boolean;
  user?: string;
  password?: string;
};
