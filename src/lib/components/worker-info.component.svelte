<script lang="ts">
	import {
		Icon,
		Loading,
		Tooltip,
		BusyWorkers,
		MaxWorkers,
		AvailableWorkers,
		PendingWorkers
	} from '$lib';
	import { onMount } from 'svelte';
</script>

<div class="flex justify-center items-center gap-1">
	<Tooltip text="idle workers">
		<div
			class="text-4xl py-1 px-3 text-white bg-green-400 flex justify-center items-center rounded-xl"
		>
			{AvailableWorkers.size}/{MaxWorkers.count}
			<Icon name="wrench" class="fill-white w-6 h-6 ml-2" />
		</div>
	</Tooltip>

	{#if BusyWorkers.size > 0}
		<Tooltip text="busy workers">
			<div
				class="text-4xl py-1 px-3 text-white bg-indigo-900 flex justify-center items-center rounded-xl"
			>
				{BusyWorkers.size}/{MaxWorkers.count}
				<Loading name="tadpole" class="w-6 h-6 fill-white ml-2" />
			</div>
		</Tooltip>
	{/if}

	{#if PendingWorkers.size > 0}
		<Tooltip text="loading workers">
			<div
				class="text-4xl py-1 px-3 text-black bg-yellow-400 flex justify-center items-center rounded-xl"
			>
				{PendingWorkers.size}/{MaxWorkers.count}
				<Loading class="w-6 h-6 fill-black ml-2" />
			</div>
		</Tooltip>
	{/if}
</div>
