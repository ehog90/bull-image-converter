export type ImageJob = {
  content: Buffer;
  name: string;
  newFileName: string;
  tempLocation: string;
};

export type StatusResponse = {
  remaining: number;
  completed: number;
};

export type ImageResponse = {
  imageUrl: string;
} & StatusResponse;
