import { commonAxios } from "@/utils/axios";
import { File } from "./file.entities";
import { FileType, MediaVisibility } from "./file.enum";
import { CreateFileDto, IUploadMediaFileRequest, IUploadMediaFileResponse, UploadManyFilesResponse } from "./file.interface";

const FILE_BASE_PATH = "file/file";

export const uploadMediaFile = async (data: IUploadMediaFileRequest): Promise<IUploadMediaFileResponse> => {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("visibility", data.visibility ?? MediaVisibility.PUBLIC);
  if (data.owner != null && data.owner !== "") formData.append("owner", data.owner);
  if (data.ownerId != null && data.ownerId !== "") formData.append("ownerId", data.ownerId);
  if (data.pathPrefix != null && data.pathPrefix !== "") formData.append("pathPrefix", data.pathPrefix);
  return (await commonAxios.post<IUploadMediaFileResponse>(`${FILE_BASE_PATH}/media/upload`, formData)).data;
};

export const createFile = async (body: CreateFileDto, onProgress?: (percent: number) => void): Promise<File> => {
  const { file, isOverwrite, type, context, generateThumbnail } = body;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("isOverwrite", isOverwrite ? "true" : "false");
  formData.append("type", type || FileType.IMAGE);
  if (context) {
    formData.append("context", context);
  }
  formData.append("generateThumbnail", generateThumbnail ? "true" : "false");

  return (
    await commonAxios.post("file/file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    })
  ).data;
};

export const createManyFiles = async (body: CreateFileDto[], onProgress?: (percent: number) => void): Promise<UploadManyFilesResponse> => {
  const formData = new FormData();
  body.forEach((fileDto) => {
    formData.append("files", fileDto.file);
  });
  formData.append("isOverwrite", body[0].isOverwrite ? "true" : "false");
  if (body[0].type) formData.append("type", body[0].type);
  if (body[0].context) formData.append("context", body[0].context);

  return (
    await commonAxios.post("file/file/upload-many", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent); // callback cập nhật UI
        }
      },
    })
  ).data;
};
