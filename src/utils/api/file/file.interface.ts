import { FileType, FileTypeEnum, MediaVisibility } from "./file.enum";

export interface IUploadMediaFileRequest {
  file: File;
  visibility?: MediaVisibility;
  owner?: string | null;
  ownerId?: string | null;
  pathPrefix?: string | null;
}

export interface IUploadMediaFileResponse {
  asset: {
    id: string;
    workspaceId: string;
    owner: string | null;
    ownerId: string | null;
    visibility: MediaVisibility;
    status: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: string;
    checksumSha256: string;
    contentVersion: string;
    bucket: string;
    objectKey: string;
    publicUrl: string;
    metadata: Record<string, unknown> | null;
    defaultFrameId: string | null;
    uploadedAt: string;
    uploadedById: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

export interface CreateFileDto {
  file: any;
  isOverwrite?: boolean;
  type?: FileType | FileTypeEnum;
  context?: string;
  generateThumbnail?: boolean;
}

// Item trả về từ file/upload-many
export interface UploadManyFileItem {
  fileName: string;
  id: string;
  url: string;
  path: string;
}

// Response chuẩn của file/upload-many
export interface UploadManyFilesResponse {
  total: number;
  uploaded: number;
  failed: number;
  items: UploadManyFileItem[];
  errors: any[];
}
