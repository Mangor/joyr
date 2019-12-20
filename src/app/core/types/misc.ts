export type ImageInfo = {
  type: string;
  size: number;
};

export type LoadedImageData = {
  fullname: string;
  data: ArrayBuffer;
  type: string;
  lastModified: number;
};

export type Message = {
  type: string;
  payload: any;
};

export type ProgressMessage = {
  progress: number;
};

export type DownloadMessage = {
  url: string;
  name: string;
};
