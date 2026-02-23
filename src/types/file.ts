export enum StagedUploadTargetGenerateUploadResource {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  // add the rest here if needed, refer : https://shopify.dev/docs/api/admin-graphql/latest/enums/StagedUploadTargetGenerateUploadResource
}

export type FileCreateInputDuplicateResolutionMode =
  | 'APPEND_UUID'
  | 'RAISE_ERROR'
  | 'REPLACE';

export type FileContentType =
  | 'EXTERNAL_VIDEO'
  | 'FILE'
  | 'IMAGE'
  | 'MODEL_3D'
  | 'VIDEO';

export type StagedMediaUploadTarget = {
  parameters: { name: string; value: string }[];
  resourceUrl: string;
  url: string;
};

export type StagedUploadInput = {
  filename: string;
  mimeType: string;
  httpMethod?: string;
  resource: StagedUploadTargetGenerateUploadResource;
  fileSize?: number;
};

export type FileCreateInput = {
  alt?: string;
  contentType?: FileContentType;
  duplicateResolutionMode?: FileCreateInputDuplicateResolutionMode;
  filename?: string;
  originalSource: string;
};

export type ImageReturnType = {
  id: string;
  fileStatus: string;
  alt: string;
  createdAt: string;
  image: {
    width: number;
    height: number;
  };
};
