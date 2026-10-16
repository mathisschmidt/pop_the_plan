<script lang="ts">
	import { resolve } from '$app/paths';
	import MaybeSheet from '#lib/components/rings/MaybeSheet.svelte';
	import SwipeCard from '#lib/components/rings/SwipeCard.svelte';
	import SwipeGuide from '#lib/components/rings/SwipeGuide.svelte';
	import { localFlag } from '#lib/client/storage.ts';
	import { DIRECTION_VERDICT, type SwipeDirection } from '#lib/components/rings/swipe.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import LogoutButton from '#lib/components/ui/LogoutButton.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import type { Verdict } from '#lib/domain/ring.ts';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	type QueuedRing = PageProps['data']['rings'][number];

	let { data }: PageProps = $props();

	// Local copy: the queue shrinks optimistically as she swipes.
	// svelte-ignore state_referenced_locally
	let queue = $state<QueuedRing[]>([...data.rings]);
	let cards = $state<Record<string, SwipeCard | null>>({});
	let maybe = $state<{ ring: QueuedRing; settle: (accepted: boolean) => void } | null>(null);
	let guide = $state<'tour' | 'help' | null>(null);

	const GUIDE_SEEN_KEY = 'ptp:swipe-guide-seen';

	// First visit on this device: walk her through the gestures (after hydration, never during SSR).
	onMount(() => {
		if (queue.length && !localFlag.get(GUIDE_SEEN_KEY)) guide = 'tour';
	});

	function closeGuide() {
		guide = null;
		localFlag.set(GUIDE_SEEN_KEY);
	}

	const top = $derived(queue[0]);
	// Render the top card last so it sits above the one peeking behind.
	const visible = $derived(queue.slice(0, 2).toReversed());

	function handleSwipe(ring: QueuedRing, direction: SwipeDirection): boolean | Promise<boolean> {
		if (direction === 'down') {
			return new Promise((settle) => (maybe = { ring, settle }));
		}
		record(ring, DIRECTION_VERDICT[direction], null);
		return true;
	}

	async function record(ring: QueuedRing, verdict: Verdict, reason: string | null) {
		queue = queue.filter((r) => r.id !== ring.id);
		if (data.preview) return;

		try {
			const response = await fetch(`/rings/${ring.id}/verdict`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ verdict, reason })
			});
			// 409: already decided (e.g. from another device) — nothing to undo.
			if (!response.ok && response.status !== 409) throw new Error(String(response.status));
		} catch {
			queue = [ring, ...queue];
			toast('Could not save that one, try again', 'error');
		}
	}

	function closeMaybe(reason: string | null) {
		if (!maybe) return;
		const { ring, settle } = maybe;
		maybe = null;
		settle(reason !== null);
		if (reason !== null) record(ring, 'maybe', reason);
	}

	function swipeTop(direction: SwipeDirection) {
		if (top && !maybe && !guide) cards[top.id]?.fling(direction);
	}

	function onkeydown(event: KeyboardEvent) {
		const direction = ({ ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down' } as const)[
			event.key as 'ArrowLeft'
		];
		if (direction) swipeTop(direction);
	}
</script>

<svelte:window {onkeydown} />

<div class="flex h-dvh flex-col overflow-hidden overscroll-none">
	<header class="flex items-center justify-between px-5 py-3">
		<Logo />
		<div class="flex items-center gap-1">
			{#if top}
				<button
					class="grid size-10 place-items-center rounded-full text-taupe active:bg-line"
					aria-label="How does it work?"
					onclick={() => (guide = 'help')}
				>
					<Icon name="help" class="size-6" />
				</button>
			{/if}
			{#if data.preview}
				<a href={resolve('/admin/(app)')} class="btn-secondary h-9 px-4 text-xs">Exit preview</a>
			{:else}
				<LogoutButton />
			{/if}
		</div>
	</header>

	{#if data.preview}
		<p class="mx-5 rounded-full bg-champagne-soft px-4 py-2 text-center text-xs text-champagne">
			Preview — your swipes are not saved
		</p>
	{/if}

	{#if top}
		<main class="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-5 pt-4 pb-6">
			<div class="relative aspect-[4/5] w-full max-w-[calc((100dvh-17rem)*0.8)]" aria-live="polite">
				{#each visible as ring (ring.id)}
					<SwipeCard
						bind:this={cards[ring.id]}
						imageUrl={ring.imageUrl}
						depth={queue.indexOf(ring)}
						onswipe={(direction) => handleSwipe(ring, direction)}
					/>
				{/each}
			</div>

			<div class="flex items-center gap-5">
				<button
					class="action size-16 text-taupe"
					aria-label="Not for me"
					onclick={() => swipeTop('left')}
				>
					<Icon name="x" class="size-7" strokeWidth={2} />
				</button>
				<button
					class="action size-12 text-champagne"
					aria-label="Maybe, but…"
					onclick={() => swipeTop('down')}
				>
					<Icon name="question" class="size-6" strokeWidth={2} />
				</button>
				<button
					class="action size-16 text-rose"
					aria-label="I love it"
					onclick={() => swipeTop('right')}
				>
					<Icon name="heart" class="size-7" filled />
				</button>
			</div>

			<p class="text-xs text-taupe">
				{queue.length} ring{queue.length > 1 ? 's' : ''} left
			</p>
		</main>
	{:else}
		<main class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
			<span class="grid size-16 place-items-center rounded-full bg-rose-soft text-rose">
				<Icon name="sparkle" class="size-8" />
			</span>
			<h1 class="text-3xl italic">That's all for now</h1>
			<p class="text-taupe">Thank you for playing. Who knows what might pop next…</p>
			{#if data.preview}<a href={resolve('/admin/(app)')} class="btn-secondary mt-4"
					>Back to dashboard</a
				>{/if}
		</main>
	{/if}
</div>

{#if maybe}
	<MaybeSheet onsubmit={(reason) => closeMaybe(reason)} oncancel={() => closeMaybe(null)} />
{/if}

{#if guide}
	<SwipeGuide tour={guide === 'tour'} onclose={closeGuide} />
{/if}

<style>
	.action {
		display: grid;
		place-items: center;
		border-radius: 9999px;
		border: 1px solid var(--color-line);
		background: var(--color-pearl);
		box-shadow: var(--shadow-card);
		transition: transform 120ms;
	}
	.action:active {
		transform: scale(0.92);
	}
</style>
