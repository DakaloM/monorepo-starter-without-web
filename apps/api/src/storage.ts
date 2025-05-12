import { AmazonStorageClient } from '@num/storage';

import { config } from './config';

export const storageClient = AmazonStorageClient.create({
  bucket: config.attachments.bucket,
  region: config.attachments.region,
  accessKeyId: config.attachments.accessKeyId,
  secretAccessKey: config.attachments.secretAccessKey,
  endpoint: config.attachments.endpoint,
});
