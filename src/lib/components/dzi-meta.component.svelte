<script lang="ts">
	import { DziSquareComponent, DZIMeta } from '$lib';
</script>

<div class="flex flex-col justify-center items-center">
	<div class="text-2xl">
		processing {DZIMeta.tileSize}x{DZIMeta.tileSize}px tiles
	</div>

	{#each DZIMeta.scaledImages as image}
		<div class="text-2xl">
			scale: {image.scale} <spam> {image.meta.width}x{image.meta.height} </spam>
			<span> {image.blob.size / (1024 * 1024)} </span>
			<span> {image.tilesWide * image.tilesHigh} tiles</span>
		</div>

		<div class="flex justify-center items-center">
			{#each Array.from({ length: image.tilesWide }, (_, i) => i) as col}
				<div class="flex justify-center items-center flex-col">
					{#each Array.from({ length: image.tilesHigh }, (_, i2) => i2) as row}
						<!-- {col}_{row} -->
						<DziSquareComponent
							status={DZIMeta.tiles[`${image.level}_${col}_${row}`]?.status ?? 'PENDING'}
						/>
					{/each}
				</div>
			{/each}
		</div>
	{/each}
</div>
