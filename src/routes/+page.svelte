<script lang="ts">
  import { onMount } from "svelte";

  onMount(async () => {
    const OpenSeadragon: any = await import(
      "../lib/seadragon/openseadragon"
    ).then(() => {
      return (window as any).OpenSeadragon;
    });

    new OpenSeadragon.Viewer({
      id: "example-custom-tilesource",
      prefixUrl: "//openseadragon.github.io/openseadragon/images/",
      tileSources: {
        Image: {
          xmlns: "http://schemas.microsoft.com/deepzoom/2008",
          Url: "//openseadragon.github.io/example-images/duomo/duomo_files/",
          Format: "jpg",
          Overlap: "2",
          TileSize: "256",
          Size: {
            Width: "13920",
            Height: "10200",
          },
        },
      },
    });
  });
</script>

<div id="example-custom-tilesource" class="openseadragon"></div>

<style>
  .openseadragon {
    height: 100%;
    width: 100%;
  }
</style>
