import { builder } from '~/graphql/builder';

import { allow } from 'graphql-shield';
import { isActiveUser } from '~/account/shield';
import { AddressSchema } from '~/address/graphql';
import { HasAssigneesType } from '~/assignee/graphql';
import { getAttachmentById, getAttachments } from '~/documents/queries';
import { HasEventsSchema } from '~/event/graphql/event';

import { Attachment, AttachmentState, AttachmentVersion } from '../attachment';

export const AttachmentStateType = builder.enumType(AttachmentState, {
  name: 'AttachmentState',
  description: 'Attachment state',
});

export const AttachmentSchema = builder.objectType(Attachment, {
  name: 'Attachment',
  description: 'An attachment to an object.',
  interfaces: [HasAssigneesType, HasEventsSchema],
  shield: isActiveUser,
  fields: (t) => ({
    id: t.exposeID('id'),
    contentLength: t.exposeInt('contentLength', {
      description: 'The size of the attachment in bytes.',
      nullable: false,
    }),
    refId: t.exposeString('refId', {}),
    sequence: t.exposeInt('sequence', {}),
    contentType: t.exposeString('contentType', {
      description: 'The content type of the attachment.',
      nullable: false,
    }),
    description: t.exposeString('description', {
      description: 'The description rendered to text of the attachment.',
      nullable: true,
    }),
    name: t.exposeString('name', {
      description: 'The name of the attachment.',
      nullable: false,
    }),
    state: t.expose('state', {
      type: AttachmentStateType,
      description: 'The state of the attachment.',
    }),
    address: t.expose('address', {
      type: AddressSchema,
      description: 'The address of the attachment.',
      nullable: true,
    }),
    versions: t.field({
      type: [AttachmentVersionType],
      description: 'Versions of the attachment.',
      resolve: async (parent, _args, ctx) => {
        const versions = await ctx.storageClient.getVersions(parent.id);

        return versions.map(
          (version) =>
            new AttachmentVersion(
              parent.id,
              parent.name,
              version.id,
              version.id,
              version.createdAt,
            ),
        );
      },
    }),
    uploadUrl: t.field({
      type: 'String',
      description: 'The URL to upload the attachment.',
      resolve: async (parent, args, ctx) => {
        const url = await ctx.storageClient.getUploadURL({
          path: parent.id,
          contentType: parent.contentType,
          contentLength: parent.contentLength,
        });

        return url;
      },
    }),
    downloadUrl: t.field({
      type: 'String',
      description: 'The URL to download the attachment.',
      resolve: (parent, _args, ctx) =>
        ctx.storageClient.getDownloadURL({
          name: parent.name,
          path: parent.id,
        }),
    }),
    createdAt: t.expose('createdAt', {
      type: 'Date',
      description: 'The creation date of the case',
    }),
  }),
});

export const AttachmentVersionType = builder.objectType(AttachmentVersion, {
  name: 'AttachmentVersion',
  description: 'A version of an attachment.',
  fields: (t) => ({
    attachmentId: t.exposeString('attachmentId', {
      description: 'The ID of the attachment.',
      nullable: false,
    }),
    attachmentName: t.exposeString('attachmentName', {
      description: 'The name of the attachment.',
      nullable: false,
    }),
    versionId: t.exposeString('versionId', {
      description: 'The ID of the version.',
      nullable: true,
    }),
    version: t.exposeString('version', {
      description: 'The version of the attachment.',
      nullable: false,
    }),
    insertedAt: t.field({
      type: 'Date',
      description: `The date and time when the version was created.`,
      nullable: true,
      resolve: (parent) => parent.insertedAt,
    }),
    downloadUrl: t.field({
      type: 'String',
      description: 'The URL to download the attachment.',
      resolve: (parent, _args, ctx) =>
        ctx.storageClient.getVersionDownloadURL(
          { name: parent.attachmentName, path: parent.attachmentId },
          parent.versionId,
        ),
    }),
  }),
});

builder.queryField('attachment', (t) =>
  t.field({
    type: AttachmentSchema,
    shield: allow,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_parent, args, ctx) => getAttachmentById(args.id.toString(), ctx),
  }),
);
const AttachmentFilter = builder.inputType('AttachmentFilter', {
  fields: (t) => ({
    limit: t.field({ type: 'Int', defaultValue: 20 }),
    page: t.field({ type: 'Int', defaultValue: 1 }),
  }),
});

builder.queryField('attachments', (t) =>
  t.field({
    type: [AttachmentSchema],
    shield: allow,
    args: {
      input: t.arg({
        type: AttachmentFilter,
        required: true,
      }),
    },
    resolve: async (_parent, args, ctx) =>
      getAttachments(ctx, {
        limit: args.input.limit || undefined,
        page: args.input.page || undefined,
      }),
  }),
);
