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

export type UrlsMessage = {
  urls: Dictionary;
};

type ImageMeta = {
  objectUrl: string;
  name: string;
};

export type ImagesMessage = {
  images: ImageMeta[];
};

export type Dictionary<T = string> = {
  [keyof: string]: T;
};
