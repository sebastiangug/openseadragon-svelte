import { browser } from "$app/environment";
import {
  type IVipsResizeInput,
  type IVipsResizeResponse,
  type IVipsQueueItem,
  type IVipsWorkerMessage,
  VipsOpEnum,
  type AssetMeta,
  type IVipsCropResponse,
  type IVipsCropInput,
} from "$lib";
import VipsWorker from "$lib/workers/vips.worker?worker";
import { SvelteMap } from "svelte/reactivity";
import Zip from "jszip";

export let MaxWorkers = $state({ count: 0 });
export let PendingWorkers = $state(new SvelteMap<string, Worker>());
export let AvailableWorkers = $state(new SvelteMap<string, Worker>());
export let BusyWorkers = $state(new SvelteMap<string, Worker>());
export let DZIMeta = $state<IDZIMeta>({
  processing: false,
  tileSize: 512,
  scaledImages: [],
  tiles: {},
});

interface IDZIMeta {
  processing?: boolean;
  maxZoom?: number;
  width?: number;
  height?: number;
  tileSize: number;
  scaledImages: IScaledImage[];
  tiles: { [key: string]: { blob?: Blob; status: IDZISquareStatus } };
}

interface IScaledImage {
  blob: Blob;
  meta: AssetMeta;
  level: number;
  scale: number;
  tilesWide: number;
  tilesHigh: number;
}

export type IDZISquareStatus =
  | "PENDING"
  | "PROCESSING"
  | "CROPPED"
  | "UPLOADING"
  | "ERROR"
  | "DONE";

/** used to get the width and height of an image file type */
export const GetImageResolution = async (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      resolve({ width: naturalWidth, height: naturalHeight });
    };
    img.onerror = () => {
      throw "Invalid image.";
    };
    img.src = URL.createObjectURL(file);
  });
};

class VipsService {
  private opsQueue: IVipsQueueItem[] = [];

  private processing = new Map<string, IVipsQueueItem>();

  constructor() {
    if (browser) {
      MaxWorkers.count = 4; // Math.max(1, navigator.hardwareConcurrency);
    }
  }

  async generateDZI(file: File) {
    // resetting state without re-assigning
    DZIMeta.processing = true;
    DZIMeta.tileSize = 512;
    DZIMeta.scaledImages = [];
    DZIMeta.tiles = {};
    DZIMeta.width = undefined;
    DZIMeta.height = undefined;
    DZIMeta.maxZoom = undefined;

    await this.processDZIPerLevel(file);
  }

  private async processDZIPerLevel(file: File) {
    // getting and setting source width/height
    const { width, height } = await GetImageResolution(file);
    DZIMeta.width = width;
    DZIMeta.height = height;
    // setting max zoom
    DZIMeta.maxZoom = Math.ceil(
      Math.log2(Math.max(width, height) / DZIMeta.tileSize)
    );

    await Promise.all(
      Array.from({ length: DZIMeta.maxZoom }, async (_, i) => {
        const level = DZIMeta.maxZoom! - i; // This counts down from maxZoom to 0
        // resizing file - now using level instead of i
        const { blob, meta } = await this.resize(file, undefined, level);
        // calculating tiles for this level
        const tilesWide = Math.ceil(meta.width! / DZIMeta.tileSize);
        const tilesHigh = Math.ceil(meta.height! / DZIMeta.tileSize);
        // scale now uses level instead of i, and gives correct scaling factor
        const scale = 1 / Math.pow(2, DZIMeta.maxZoom! - level);
        // pushing to status obj with corrected level
        DZIMeta.scaledImages.push({
          blob,
          meta,
          scale,
          tilesHigh,
          tilesWide,
          level, // using level instead of i ensures correct zoom level assignment
        });
      })
    );

    // looping over all images concurrently
    await Promise.all(
      DZIMeta.scaledImages.map(async (scaledImage) => {
        // Process tiles sequentially for each scaled image
        for (let x = 0; x < scaledImage.tilesWide; x++) {
          for (let y = 0; y < scaledImage.tilesHigh; y++) {
            DZIMeta.tiles[`${scaledImage.level}_${x}_${y}`] = {
              status: "PROCESSING",
            };

            const startX = x * DZIMeta.tileSize;
            const startY = y * DZIMeta.tileSize;

            // skipping out of bounds
            if (
              startX >= scaledImage.meta.width! ||
              startY >= scaledImage.meta.height!
            ) {
              console.log(
                `Skipping out-of-bounds tile for scaled image ${scaledImage.scale}, x:${x}, y:${y}`
              );
              continue;
            }

            // Calculate tile dimensions
            const tileWidth = Math.min(
              DZIMeta.tileSize,
              scaledImage.meta.width! - startX
            );
            const tileHeight = Math.min(
              DZIMeta.tileSize,
              scaledImage.meta.height! - startY
            );

            try {
              const cropped = await this.crop(
                scaledImage.blob,
                startX,
                startY,
                tileWidth,
                tileHeight
              );

              DZIMeta.tiles[`${scaledImage.level}_${x}_${y}`] = {
                //	blob: cropped.blob,
                status: "CROPPED",
              };
            } catch (error) {
              console.error(
                `Failed to generate tile for scaled image ${scaledImage.scale}, x:${x}, y:${y}`,
                {
                  startX,
                  startY,
                  tileWidth,
                  tileHeight,
                },
                error
              );
            }
          }
        }
        console.log(`Completed processing scale ${scaledImage.scale}`);
      })
    );
  }

  private async processDZIconcurrently(file: File) {
    // getting and setting source width/height
    const { width, height } = await GetImageResolution(file);
    DZIMeta.width = width;
    DZIMeta.height = height;
    // setting max zoom
    DZIMeta.maxZoom = Math.ceil(
      Math.log2(Math.max(width, height) / DZIMeta.tileSize)
    );

    const numLevels = DZIMeta.maxZoom + 1;
    await Promise.all(
      Array.from({ length: numLevels }, async (_, i) => {
        const level = numLevels - 1 - i; // This counts down from maxZoom to 0
        // resizing file - now using level instead of i
        const { blob, meta } = await this.resize(file, undefined, level);
        // calculating tiles for this level
        const tilesWide = Math.ceil(meta.width! / DZIMeta.tileSize);
        const tilesHigh = Math.ceil(meta.height! / DZIMeta.tileSize);
        // scale now uses level instead of i, and gives correct scaling factor
        const scale = 1 / Math.pow(2, DZIMeta.maxZoom! - level);
        // pushing to status obj with corrected level
        DZIMeta.scaledImages.push({
          blob,
          meta,
          scale,
          tilesHigh,
          tilesWide,
          level, // using level instead of i ensures correct zoom level assignment
        });
      })
    );

    // looping over all images concurrently
    await Promise.all(
      DZIMeta.scaledImages.map(async (scaledImage) => {
        // looping over the number of tiles WIDE of each image
        await Promise.all(
          Array.from({ length: scaledImage.tilesWide }, async (_, x) => {
            // looping over the tiles HIGH of each image
            await Promise.all(
              Array.from({ length: scaledImage.tilesHigh }, async (_, y) => {
                DZIMeta.tiles[`${scaledImage.scale}_${x}_${y}`] = {
                  status: "PROCESSING",
                };

                const startX = x * DZIMeta.tileSize;
                const startY = y * DZIMeta.tileSize;

                // skipping out of bounds
                if (
                  startX >= scaledImage.meta.width! ||
                  startY >= scaledImage.meta.height!
                ) {
                  console.log(
                    `Skipping out-of-bounds tile for scaled image ${scaledImage.scale}, x:${x}, y:${y}`
                  );
                  return;
                }

                // Calculate tile dimensions, ensuring we don't exceed image boundaries
                const tileWidth = Math.min(
                  DZIMeta.tileSize,
                  scaledImage.meta.width! - startX
                );
                const tileHeight = Math.min(
                  DZIMeta.tileSize,
                  scaledImage.meta.height! - startY
                );
                try {
                  const cropped = await this.crop(
                    scaledImage.blob,
                    startX,
                    startY,
                    tileWidth,
                    tileHeight
                  );

                  console.log("PROCESSED", `${scaledImage.scale}_${x}_${y}`);

                  DZIMeta.tiles[`${scaledImage.scale}_${x}_${y}`] = {
                    //	blob: cropped.blob,
                    status: "CROPPED",
                  };
                } catch (error) {
                  console.error(
                    `Failed to generate tile for scaled image ${scaledImage.scale}, x:${x}, y:${y}`,
                    {
                      startX,
                      startY,
                      tileWidth,
                      tileHeight,
                    },
                    error
                  );
                }
              })
            );
          })
        );
      })
    );
  }

  private handleWorkerMessage(e: MessageEvent<IVipsWorkerMessage>) {
    const { type, data, error, message, workerId, requestId } = e.data;

    console.log("WORKER DONE WITH TASK", data);

    if (message === "VIPS LOADED") {
      console.log();

      const worker = PendingWorkers.get(requestId);
      if (!worker) {
        console.error("COULD NOT FIND PENDING WORKER", data);
        return;
      }
      // moving worker to available worker
      AvailableWorkers.set(workerId, worker);
      PendingWorkers.delete(workerId);
      this.processNextItem();
      return;
    }

    if (error) {
      console.error(error);
    }

    if (!requestId || !this.processing.has(requestId)) {
      console.log("no requestId found");
      return;
    }

    const item = this.processing.get(requestId)!;
    this.processing.delete(requestId);

    if (type === "success" && data) {
      item.resolve(data);
    } else if (type === "error") {
      item.reject(new Error(error));
    }

    if (!workerId) {
      console.error("no worker id found, cannot free up busy worker");
    }

    const busyWorker = BusyWorkers.get(workerId);
    AvailableWorkers.set(workerId, busyWorker!);
    BusyWorkers.delete(workerId);

    // Process next item if any
    this.processNextItem();
  }

  private processNextItem() {
    // Find an available worker
    const anyWorkerKey = AvailableWorkers.keys().next().value;
    if (!anyWorkerKey) {
      this.tryIncreaseWorkers();
      return;
    }
    const worker = AvailableWorkers.get(anyWorkerKey);

    if (this.opsQueue.length === 0) return;
    const item = this.opsQueue.shift()!;

    this.processing.set(item.data.requestId, item);

    BusyWorkers.set(anyWorkerKey, worker!);
    AvailableWorkers.delete(anyWorkerKey);

    console.log("PROCESSING NEXT ITEM");

    worker!.postMessage({
      data: item.data,
    });
  }

  private tryIncreaseWorkers() {
    if (
      AvailableWorkers.size + BusyWorkers.size + PendingWorkers.size >=
      MaxWorkers.count
    ) {
      console.log("Maximum workers in use.");
      return;
    }

    const worker = new VipsWorker();
    worker.addEventListener("message", this.handleWorkerMessage.bind(this));
    const workerId = crypto.randomUUID();
    PendingWorkers.set(workerId, worker);

    worker.postMessage({
      data: {
        op: "LOAD_VIPS",
        requestId: workerId,
      },
    });
  }

  async crop(
    blob: Blob,
    startX: number,
    startY: number,
    tileWidth: number,
    tileHeight: number
  ): Promise<IVipsCropResponse> {
    return new Promise((resolve, reject) => {
      this.opsQueue.push({
        data: {
          blob,
          startX,
          startY,
          tileWidth,
          tileHeight,
          requestId: crypto.randomUUID(),
          op: VipsOpEnum.CROP,
        } as IVipsCropInput,
        resolve: resolve as any,
        reject,
      });
      this.processNextItem();
    });
  }

  async resize(
    file: File,
    longEdge?: number,
    scale?: number
  ): Promise<IVipsResizeResponse> {
    return new Promise((resolve, reject) => {
      this.opsQueue.push({
        data: {
          file,
          requestId: crypto.randomUUID(),
          longEdge,
          scale,
          op: VipsOpEnum.RESIZE,
        } as IVipsResizeInput,
        resolve: resolve as any,
        reject,
      });
      this.processNextItem();
    });
  }

  async createDZIArchive(): Promise<Blob> {
    const zip = new Zip();

    // Add each tile to the zip
    for (const [key, tile] of Object.entries(DZIMeta.tiles)) {
      zip.file(`${key}.jpg`, tile.blob!);
    }

    // Generate the zip file
    return await zip.generateAsync({ type: "blob" });
  }
}

export default new VipsService();
