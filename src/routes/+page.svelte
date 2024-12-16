<script lang="ts">
  import { onMount } from "svelte";
  // @ts-ignore
  import { default as OpenSeadragon } from "openseadragon";

  let container: HTMLDivElement = $state(new HTMLDivElement());

  onMount(async () => {
    new OpenSeadragon.Viewer({
      id: "example-custom-tilesource",
      prefixUrl: "/openseadragon/images/",
      navigatorSizeRatio: 0.25,
      wrapHorizontal: true,
      crossOriginPolicy: "Anonymous",
      tileSources: {
        height: 512 * 256,
        width: 512 * 256,
        tileSize: 256,
        minLevel: 8,
        getTileUrl: (level: number, x: number, y: number) => {
          return (
            "http://s3.amazonaws.com/com.modestmaps.bluemarble/" +
            (level - 8) +
            "-r" +
            y +
            "-c" +
            x +
            ".jpg"
          );
        },
      },
    });
  });
</script>

<div class="container">
  <div
    id="example-custom-tilesource"
    bind:this={container}
    class="openseadragon"
  ></div>
</div>

<style>
  .container,
  .openseadragon {
    height: 100%;
    width: 100%;
  }
</style>
