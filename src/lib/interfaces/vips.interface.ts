export interface AssetMeta {
  mime?: string;
  size?: number;
  width?: number;
  height?: number;
}

/** possible VIPS operations */
export enum VipsOpEnum {
  RESIZE = "RESIZE",
  BATCH_RESIZE_VARIANTS = "BATCH_RESIZE_VARIANTS",
  CROP = "CROP",
  LOAD_VIPS = "LOAD_VIPS",
}

export type IVipsOps = keyof VipsOpEnum;
export type IVipsResponses =
  | IVipsResizeResponse
  | IVipsLoadResponse
  | IVipsCropResponse;
export type IVipsInputs = IVipsResizeInput | IVipsLoadInput | IVipsCropInput;

/** responses coming from workers */
export interface IVipsWorkerMessage {
  type: "status" | "success" | "error";
  message?: string;
  workerId: string;
  requestId: string;
  data?: IVipsResponses;
  error?: string;
}

/** our processing queue */
export interface IVipsQueueItem {
  data: IVipsInputs;
  resolve: (response: IVipsResponses) => void;
  reject: (reason: any) => void;
}

//  SPECIFIC OPERATIONS

// LOAD VIPS
export interface IVipsLoadInput {
  op: VipsOpEnum.LOAD_VIPS;
  requestId: string;
}

export interface IVipsLoadResponse {
  message: "VIPS LOADED";
  requestId: string;
}

// RESIZE
export interface IVipsResizeInput {
  op: VipsOpEnum.RESIZE;
  requestId: string;
  file: File;
  longEdge?: number;
  scale?: number;
}
export interface IVipsResizeResponse {
  blob: Blob;
  meta: AssetMeta;
}

// CROP
export interface IVipsCropInput {
  op: VipsOpEnum.CROP;
  requestId: string;
  blob: Blob;
  startX: number;
  startY: number;
  tileWidth: number;
  tileHeight: number;
}

export interface IVipsCropResponse {
  blob: Blob;
}
