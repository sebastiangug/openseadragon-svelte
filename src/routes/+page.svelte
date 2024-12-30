<script lang="ts">
  import {
    DropAssetComponent,
    DziMetaComponent,
    Icon,
    VipsService,
    WorkerInfoComponent,
  } from "$lib";
  import { slide } from "svelte/transition";
  import "../app.css";

  let error = $state("");
  let pendingFile = $state<File>();

  export const MaxFileSize = 157286400;
  export const IsSizeSupported = (file?: File): boolean => {
    return file ? file.size < MaxFileSize : false;
  };

  const onFile = async (files: FileList) => {
    error = "";
    try {
      const file = files?.[0];
      if (!file) throw "no file selected";
      if (!IsSizeSupported(file)) throw `Max ${MaxFileSize / (1024 * 1024)}mb`;

      // doing a bunch of checks
      if (!file.type.startsWith("image")) throw "Unsupported file type.";

      pendingFile = file;
    } catch (err: any) {
      error = err;
    }
  };

  const upload = async () => {
    await VipsService.generateDZI(pendingFile!);
    const zipBlob = await VipsService.createDZIArchive();

    // Optional: trigger download
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "dzi_tiles.zip";
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };
</script>

<div class="flex justify-center items-center flex-col pt-10 px-10 gap-10">
  <WorkerInfoComponent />

  <div
    class="w-full rounded-3xl bg-slate-100 flex flex-col justify-center items-center py-3 px-6 gap-3 shadow-xl"
  >
    <div class="flex items-center justify-between w-full">
      <Icon name="image" class="w-6 h-6 fill-zinc-900" />
      <span class="text-xl"> Deep Zoom Image </span>
      <Icon name="info" class="w-6 h-6 fill-zinc-900" />
    </div>

    <DziMetaComponent />

    {#if error}
      <div
        transition:slide
        class="flex justify-center items-center font-bold w-full gap-2"
      >
        <Icon name="error" class="w-6 h-6 fill-red-500" />
        <span class="text-red-500"> {error}</span>
      </div>
    {/if}

    {#if pendingFile}
      <div
        transition:slide
        class="w-full flex flex-col justify-center items-center gap-4"
      >
        <div class="flex justify-between items-center w-full">
          <div class="flex gap-2">
            <Icon name="draft" class="w-6 h-6" />
            <div class="text-lg">{pendingFile.name}</div>
          </div>
          <div class="flex font-bold text-lg items-end">
            <span style="line-height: 1.3;"
              >{(pendingFile.size / (1024 * 1024)).toFixed(2)}</span
            >
            <span class="text-sm">mb</span>
          </div>
        </div>

        <button
          onclick={upload}
          class="bg-slate-700 px-4 py-2 text-xl text-white rounded-xl"
          >Generate DZI</button
        >
      </div>
    {:else}
      <div transition:slide class="w-full">
        <DropAssetComponent {onFile} mimes={["image/jpeg"]} />
      </div>
    {/if}
  </div>

  <style>
    .selected {
      @apply bg-green-400 text-white hover:!bg-green-500 hover:!text-slate-100;
    }
  </style>
</div>
