import { BaseModel } from '@repo/datakit';
import mime from 'mime-types';
import path from 'path';
import { User } from '~/account/user';
import { Address } from '~/address/address';
import { Assignee } from '~/assignee/assignee';
import { Validator } from '~/domain/validation';
import { Event } from '~/event';
import { Type, TypeIdentifier } from '~/type/type';

import { ContentType, contentTypes } from './contentTypes';

export { AttachmentVersion } from './version';

export enum AttachmentState {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const maxContentLength = 100 * 1024 * 1024; // 100mb
export class Attachment extends BaseModel {
  assignees: Assignee[];
  contentType: ContentType;
  sequence: number;
  contentLength!: number;
  creator: User;
  creatorId: string;
  deletedAt: Date | null;
  description: string;
  id: string;
  confidential: boolean;
  createdAt!: Date;
  name: string;
  refId: string;
  state: AttachmentState;
  refTypeId: string;
  versionCount: number;
  updatedAt: Date;
  events: Event<Attachment>[];
  address: Address | null;

  static tableName = 'attachment';
  static typeIdentifier = TypeIdentifier.Attachment;

  static createSchema() {
    return Validator.create((z, is) =>
      z.object({
        contentType: z.enum(contentTypes),
        contentLength: z.number().positive().max(maxContentLength),
        description: z.string().trim().min(1).max(5000).optional(),
        creatorId: z.string().uuid(),
        name: z.string().trim().superRefine(is.filename),
        refId: z.string().uuid(),
        refTypeId: z.string().uuid(),
        state: z.nativeEnum(AttachmentState),
        confidential: z.boolean(),
        sequence: z.number().positive().min(1),
      }),
    );
  }

  static updateSchema() {
    return Validator.create((z, is) =>
      z.object({
        description: z.string().trim().min(1).max(5000).optional(),
        editorId: z.string().uuid(),
        name: z.string().trim().min(1).max(5000).optional(),
        state: z.nativeEnum(AttachmentState).optional(),
        updatedAt: z.date(),
      }),
    );
  }

  static parseContentType(filename: string) {
    const ext = path.extname(filename);

    const mimeType = mime.contentType(ext) as string;

    return mimeType;
  }

  static get relationMappings() {
    return {
      assignees: {
        relation: BaseModel.HasManyRelation,
        modelClass: Assignee,
        join: {
          from: 'attachment.id',
          to: 'assignee.refId',
        },
      },
      address: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Address,
        join: {
          from: 'attachment.fileId',
          to: 'address.refId',
        },
      },
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'attachment.creatorId',
          to: 'user.id',
        },
      },
      refType: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Type,
        join: {
          from: 'attachment.refTypeId',
          to: 'type.id',
        },
      },

      events: {
        relation: BaseModel.HasManyRelation,
        modelClass: Event,
        join: {
          from: 'attachment.id',
          to: 'event.refId',
        },
      },
    };
  }
}
