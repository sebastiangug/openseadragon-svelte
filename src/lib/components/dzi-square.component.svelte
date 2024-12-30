<script lang="ts">
  import { Icon, Loading, type IDZISquareStatus } from "$lib";

  interface IProps {
    status: IDZISquareStatus;
    progress?: { progress: string };
  }

  let { status, progress = { progress: "" } }: IProps = $props();
</script>

<div class="{status} flex justify-center items-center w-6 h-6">
  {#if status === "PROCESSING"}
    <Loading name="tadpole" class="fill-white w-4 h-4" />
  {:else if status === "UPLOADING"}
    <Loading class="fill-white w-4 h-4" />
  {:else if status === "ERROR"}
    <Icon name="error" class="fill-white w-4 h-4" />
  {:else if status === "DONE"}
    <Icon name="confirm" class="fill-white w-4 h-4" />
  {:else if status === "CROPPED"}
    <Icon name="confirm" class="fill-white w-4 h-4" />
  {:else}
    <Icon name="image" class="fill-white w-4 h-4" />
  {/if}
</div>

<style>
  .PENDING {
    @apply bg-yellow-400;
  }

  .PROCESSING {
    @apply bg-orange-400;
  }

  .UPLOADING {
    @apply bg-orange-400;
  }

  .ERROR {
    @apply bg-red-400;
  }

  .DONE {
    @apply bg-green-400;
  }

  .CROPPED {
    @apply bg-slate-600;
  }
</style>
