import { FileStatus } from "./file.enum";

export interface File {
  name: string;
  url: string;
  logo: string;
  images: string[];
  thumbnailUrl: string;
  size: number;
  mimetype: string;
  status: FileStatus;
}
