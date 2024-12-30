<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Properties extends SVGAttributes<SVGSVGElement> {
    name?: "pulse" | "tadpole";
  }

  const {
    name = "pulse",
    color = "interactive-default",
    ...attributes
  }: Properties = $props();
</script>

{#if name === "pulse"}
  <svg {...attributes} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <style>
      .spinner_7NYg {
        animation: spinner_0KQs 1.2s cubic-bezier(0.52, 0.6, 0.25, 0.99)
          infinite;
      }
      @keyframes spinner_0KQs {
        0% {
          r: 0;
          opacity: 1;
        }
        100% {
          r: 11px;
          opacity: 0;
        }
      }
    </style>
    <circle class="spinner_7NYg" cx="12" cy="12" r="0" />
  </svg>
{/if}

{#if name === "tadpole"}
  <svg {...attributes} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
    ><path
      d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
      ><animateTransform
        attributeName="transform"
        type="rotate"
        dur="0.75s"
        values="0 12 12;360 12 12"
        repeatCount="indefinite"
      /></path
    ></svg
  >
{/if}
