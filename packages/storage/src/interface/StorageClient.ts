export interface DocumentVersion {
  id: string;
  createdAt: Date;
}

export interface StorageClient {
  /**
   * Get a URL to upload a file to.
   *
   * @param params - The parameters to get the upload URL for.
   * @param expiresIn - The number of minutes the URL should be valid for.
   */
  getUploadURL(params: GetUploadParams, expiresIn?: number): Promise<string>;

  /**
   * Get a URL to download a file from.
   *
   * @param file - The file to get the download URL for.
   */
  getDownloadURL(file: File): Promise<string>;
  /**
   * Get the versions for a key.
   *
   * @param key - The key to get the versions for.
   */
  getVersions(key: string): Promise<DocumentVersion[]>;

  /**
   * Get a URL to download a version of a file from.
   *
   * @param file - The file to get the download URL for.
   * @param versionId - The version ID to get the download URL for.
   */
  getVersionDownloadURL(file: File, versionId: string): Promise<string>;

  /**
   *
   * @param key - The key to upload the file to.
   * @param data - The data to upload.
   * @param contentType - The content type of the data.
   */
  upload(key: string, data: string | Buffer, contentType: string): Promise<void>;
}

export interface GetUploadParams {
  path: string;
  contentType: string;
  contentLength: number;
}

export type UploadField = {
  key: string;
  value: string;
};

export type GetUploadResponse = {
  url: string;
  fields: UploadField[];
};

export interface File {
  name: string;
  path: string;
}
