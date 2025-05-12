import {
  S3Client,
  GetObjectCommand,
  ListObjectVersionsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetUploadParams, StorageClient, File, DocumentVersion } from '~/interface/StorageClient';

export class AmazonStorageClient implements StorageClient {
  static create(options: AmazonStorageClientCreateOptions): AmazonStorageClient {
    const { bucket, region, accessKeyId, acl, endpoint, secretAccessKey } = options;
    const hasCredentials = accessKeyId && secretAccessKey;
    const credentials = hasCredentials ? { accessKeyId, secretAccessKey } : undefined;

    const client = new S3Client({
      region,
      credentials,
      endpoint,
    });

    return new AmazonStorageClient(client, bucket, acl);
  }
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly acl = AmazonCannedAccessControlList.AuthenticatedRead,
  ) {}

  getVersionDownloadURL(file: File, versionId: string): Promise<string> {
    const contentDisposition = `attachment; filename=${encodeURIComponent(file.name)}`;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.path,
      ResponseContentDisposition: contentDisposition,
      VersionId: versionId,
    });

    return getSignedUrl(this.client, command, { expiresIn: 60 * 60 * 24 });
  }

  async getVersions(key: string): Promise<DocumentVersion[]> {
    const command = new ListObjectVersionsCommand({
      Bucket: this.bucket,
      Prefix: key,
    });

    const { Versions = [] } = await this.client.send(command);

    return Versions.map((version) => ({
      id: version.VersionId || '',
      createdAt: version.LastModified || new Date(),
    }));
  }

  getDownloadURL(file: File): Promise<string> {
    const contentDisposition = `attachment; filename=${encodeURIComponent(file.name)}`;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.path,
      ResponseContentDisposition: contentDisposition,
    });

    return getSignedUrl(this.client, command, { expiresIn: 60 * 60 * 24 });
  }

  async getUploadURL(params: GetUploadParams, expiresIn = 5): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.path,
      ContentType: params.contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn: 60 * expiresIn });
  }

  async upload(key: string, data: string | Buffer, contentType: string): Promise<void> {
    const Body = typeof data === 'string' ? Buffer.from(data, 'base64') : data;

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);

    await this.client.send(command);
  }
}

export enum AmazonCannedAccessControlList {
  AuthenticatedRead = 'authenticated-read',
  Private = 'private',
  PublicRead = 'public-read',
  PublicReadWrite = 'public-read-write',
  AwsExecRead = 'aws-exec-read',
  BucketOwnerRead = 'bucket-owner-read',
  BucketOwnerFullControl = 'bucket-owner-full-control',
  LogDeliveryWrite = 'log-delivery-write',
}

interface AmazonStorageClientCreateOptions {
  bucket: string;
  region: string;
  acl?: AmazonCannedAccessControlList;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
}
