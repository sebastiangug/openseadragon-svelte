<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Properties extends SVGAttributes<SVGSVGElement> {
    name: string;
    element?: SVGSVGElement;
  }

  let {
    name,
    color = "primary",
    element = $bindable(),
    ...attributes
  }: Properties = $props();
</script>

<svg bind:this={element} {...attributes}>
  <use href={`/icons.svg#${name}`} />
</svg>
