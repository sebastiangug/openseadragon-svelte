// place files you want to import through the `$lib` alias in this folder.
export {
  default as VipsService,
  MaxWorkers,
  PendingWorkers,
  AvailableWorkers,
  BusyWorkers,
  DZIMeta,
  type IDZISquareStatus,
} from "./services/vips.service.svelte";
export * from "./interfaces/vips.interface";
export { default as DziSquareComponent } from "./components/dzi-square.component.svelte";
export { default as WorkerInfoComponent } from "./components/worker-info.component.svelte";
export { default as DziMetaComponent } from "./components/dzi-meta.component.svelte";
export { default as Icon } from "./components/icon.component.svelte";
export { default as DropAssetComponent } from "./components/drop-asset.component.svelte";
export { default as Tooltip } from "./components/tooltip.component.svelte";
export { default as Loading } from "./components/loading.component.svelte";
