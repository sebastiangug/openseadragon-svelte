/// <reference lib="webworker" />

import type { AssetMeta } from "$lib";
import {
  type IVipsResizeInput,
  type IVipsResizeResponse,
  type IVipsLoadInput,
  type IVipsCropInput,
  type IVipsInputs,
  type IVipsCropResponse,
} from "../interfaces/vips.interface";

import type Vips from "wasm-vips";

let vips: NonNullable<typeof Vips>;
let workerId: string;

self.onmessage = async (e: MessageEvent<{ data: IVipsInputs }>) => {
  const data = e.data.data;

  try {
    switch (data.op) {
      case "RESIZE": {
        await resize(data);
        break;
      }
      case "LOAD_VIPS": {
        await loadVips(data);
        break;
      }
      case "CROP": {
        await crop(data);
        break;
      }
      default:
        throw new Error(`Unknown operation: ${data.op}`);
    }
  } catch (error) {
    self.postMessage({ success: false, error: String(error), workerId });
  }
};

const loadVips = async (data: IVipsLoadInput) => {
  if (!vips) {
    await import("wasm-vips").then(async (m) => {
      vips = await m.default();
    });

    // setting worker id
    workerId = data.requestId;

    self.postMessage({
      message: "VIPS LOADED",
      workerId,
      requestId: data.requestId,
    });
  }
};

const crop = async (data: IVipsCropInput) => {
  const image = vips.Image.newFromBuffer(await data.blob.arrayBuffer());

  const blob = image.crop(
    data.startX,
    data.startY,
    data.tileWidth,
    data.tileHeight
  );

  const response: IVipsCropResponse = {
    blob: new Blob([blob.jpegsaveBuffer({ Q: 95 })], { type: "image/jpeg" }),
  };

  self.postMessage({
    type: "success",
    requestId: data.requestId,
    workerId,
    data: response,
  });
};

const resize = async (data: IVipsResizeInput) => {
  // preparing metadata
  const meta: AssetMeta = {};
  meta.mime = "image/jpeg";

  // resizing
  const img = vips.Image.newFromBuffer(await data.file.arrayBuffer());
  const scale =
    data.scale ?? scaleFactor(img.width, img.height, data.longEdge!);
  const resized = img.resize(scale);

  // extracting new width/height
  meta.width = resized.width;
  meta.height = resized.height;

  // converting to blob
  const blob = new Blob([resized.jpegsaveBuffer({ Q: 95 })], {
    type: "image/jpeg",
  });
  meta.size = blob.size;
  // preparing response
  const response: IVipsResizeResponse = {
    blob,
    meta,
  };

  // posting response
  self.postMessage({
    type: "success",
    requestId: data.requestId,
    workerId,
    data: response,
  });
};

const scaleFactor = (
  width: number,
  height: number,
  longEdge: number
): number => {
  const max = Math.max(width, height);
  if (max <= longEdge) {
    return 1;
  }
  return longEdge / max;
};
