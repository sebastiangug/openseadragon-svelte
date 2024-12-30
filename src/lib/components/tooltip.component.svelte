<script lang="ts">
  interface IProps {
    children: any;
    text: string;
  }

  const { text, children }: IProps = $props();
  let hovering = $state(false);
</script>

<div
  role="tooltip"
  class="relative"
  onfocus={() => (hovering = true)}
  onfocusout={() => (hovering = false)}
  onmouseover={() => (hovering = true)}
  ontouchstart={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  ontouchend={() => (hovering = false)}
>
  {@render children()}

  {#if hovering}
    <div
      class="absolute whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 px-2 py-1 mb-1 rounded-xl"
    >
      {text}
    </div>
  {/if}
</div>
