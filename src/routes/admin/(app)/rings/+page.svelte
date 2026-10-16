<script lang="ts">
	import { resolve } from '$app/paths';
	import RingTile from '#lib/components/admin/RingTile.svelte';
	import { STATUS_META } from '#lib/components/admin/statuses.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { RING_STATUSES } from '#lib/domain/ring.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex items-end justify-between">
	<h1 class="text-3xl">Rings</h1>
	<a href={resolve('/admin/(app)/rings/new')} class="btn-primary h-10 px-4"
		><Icon name="plus" /> Add</a
	>
</div>

<nav class="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Filter by verdict">
	{#each RING_STATUSES as status (status)}
		<a
			href={resolve(`/admin/(app)/rings?status=${status}`)}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
			class={[
				'shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap',
				data.status === status ? 'border-ink bg-ink text-pearl' : 'border-line bg-pearl text-taupe'
			]}
			aria-current={data.status === status ? 'page' : undefined}
		>
			{STATUS_META[status].label}
			<span class="ml-1 opacity-60">{data.counts[status]}</span>
		</a>
	{/each}
</nav>

{#if data.rings.length}
	<section class="grid grid-cols-2 gap-x-3 gap-y-5">
		{#each data.rings as ring (ring.id)}
			<RingTile {ring} canReset={data.status !== 'pending'} />
		{/each}
	</section>
{:else}
	<p class="panel text-center text-sm text-taupe">Nothing here yet.</p>
{/if}
