export class AttachmentVersion {
  constructor(
    public attachmentId: string,
    public attachmentName: string,
    public versionId: string,
    public version: string,
    public insertedAt: Date,
  ) {}
}
