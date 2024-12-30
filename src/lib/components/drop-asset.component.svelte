<script lang="ts">
  import {
    type ChangeEventHandler,
    type DragEventHandler,
  } from "svelte/elements";

  interface IProps {
    mimes?: Array<string | "*">;
    multiple?: boolean;
    disabled?: boolean;
    onFile: (file: FileList) => void;
  }
  let {
    mimes = ["*"],
    multiple = false,
    onFile,
    disabled = false,
  }: IProps = $props();
  let input = $state<HTMLInputElement>();
  let dragging = $state(false);

  let onchange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!disabled) {
      if (event.currentTarget.files) onFile(event.currentTarget.files);
    }
  };

  const ondrop: DragEventHandler<any> = (event) => {
    if (!disabled) {
      event.preventDefault();
      onFile(event.dataTransfer?.files as any);
      dragging = false;
    }
  };

  const ondragover: DragEventHandler<any> = (event) => {
    event.preventDefault();
    dragging = true;
  };

  const ondragleave: DragEventHandler<any> = (event) => {
    event.preventDefault();
    dragging = false;
  };
</script>

<div class="w-full" role="region" {ondragover} {ondragleave} {ondrop}>
  <div
    class:border-zinc-700={dragging && !disabled}
    role="button"
    tabindex="0"
    onclick={() => !disabled && input?.click()}
    onkeydown={() => !disabled && input?.click}
    class="w-full
        {disabled && 'cursor-not-allowed border-gray-300'}
        h-20
        flex
        justify-center
        items-center
        border-dashed
        border-4
        border-slate-400/90
        my-2
        transition-all
        duration-200
        {!disabled && 'hover:border-zinc-700'}
        ease-inout"
  >
    <span
      class:dragging={dragging && !disabled}
      class="text-xl
            {disabled && 'text-gray-300'}
        font-bold
        hover:dragging
        p-5
        text-slate-400/90
        transition-all
        duration-200
        {!disabled && 'hover:scale-110 hover:text-slate-700'}
        ease-inout"
    >
      drop or browse for file
    </span>
  </div>
</div>

<input
  type="file"
  {multiple}
  class="hidden"
  bind:this={input}
  {onchange}
  accept={mimes.join(",")}
/>

<style>
  .dragging {
    @apply scale-110 text-zinc-700;
  }
</style>
