export const extensions = [
  '.doc',
  '.docx',
  '.pdf',
  '.odt',
  '.ods',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',

  '.csv',

  '.msg',

  '.zip',

  '.jpg',
  '.jpeg',
  '.png',
  '.tif',
  '.tiff',

  '.avi',
  '.m4v',
  '.mp4',
] as const;
/**
 * This is the computed content types for the extensions above
 */
export const contentTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain; charset=utf-8',
  'text/csv; charset=utf-8',
  'application/vnd.ms-outlook',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'video/x-msvideo',
  'video/x-m4v',
  'video/mp4',
] as const;

export type Extension = (typeof extensions)[number];
export type ContentType = (typeof contentTypes)[number];
