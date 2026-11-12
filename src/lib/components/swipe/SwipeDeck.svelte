<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { localFlag } from '#lib/client/storage.ts';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import { CATEGORY_META, countLabel, type Category } from '#lib/domain/category.ts';
	import type { Verdict } from '#lib/domain/ring.ts';
	import AllDone from './AllDone.svelte';
	import DeckSwitch from './DeckSwitch.svelte';
	import MaybeSheet from './MaybeSheet.svelte';
	import SwipeCard from './SwipeCard.svelte';
	import SwipeGuide from './SwipeGuide.svelte';
	import SwipeHeader from './SwipeHeader.svelte';
	import { DIRECTION_VERDICT, type SwipeDirection } from './swipe.ts';

	type QueuedPicture = { id: string; imageUrl: string };

	interface Props {
		category: Category;
		/** Pending pictures of this deck, in order. */
		pictures: QueuedPicture[];
		/** Every deck she can switch to (including this one), with its pending count. */
		decks: { category: Category; pending: number }[];
		preview: boolean;
	}

	let { category, pictures, decks, preview }: Props = $props();

	// Local copy: the queue shrinks optimistically as she swipes. The page re-mounts this
	// component when she switches deck, so it never needs to follow `pictures`.
	// svelte-ignore state_referenced_locally
	let queue = $state<QueuedPicture[]>([...pictures]);
	let cards = $state<Record<string, SwipeCard | null>>({});
	let maybe = $state<{ picture: QueuedPicture; settle: (accepted: boolean) => void } | null>(null);
	let guide = $state<'tour' | 'intro' | 'help' | null>(null);

	const meta = $derived(CATEGORY_META[category]);

	// The gestures tour is shown once per device; each deck then gets its own short intro.
	// `ptp:swipe-guide-seen` predates decks: it means "gestures and ring intro seen".
	const LEGACY_KEY = 'ptp:swipe-guide-seen';
	const GESTURES_KEY = 'ptp:swipe-gestures-seen';
	// svelte-ignore state_referenced_locally
	const introKey = category === 'ring' ? LEGACY_KEY : `ptp:deck-intro-seen:${category}`;

	onMount(() => {
		if (!queue.length) return;
		const gesturesSeen = localFlag.get(GESTURES_KEY) || localFlag.get(LEGACY_KEY);
		if (!gesturesSeen) guide = 'tour';
		else if (!localFlag.get(introKey)) guide = 'intro';
	});

	function closeGuide() {
		if (guide === 'tour') localFlag.set(GESTURES_KEY);
		if (guide !== 'help') localFlag.set(introKey);
		guide = null;
	}

	const top = $derived(queue[0]);
	// Render the top card last so it sits above the one peeking behind.
	const visible = $derived(queue.slice(0, 2).toReversed());

	// The current deck's count follows her swipes; the others come from the server.
	const liveDecks = $derived(
		decks.map((deck) => (deck.category === category ? { ...deck, pending: queue.length } : deck))
	);
	const nextDeck = $derived(liveDecks.find((d) => d.category !== category && d.pending > 0));

	function handleSwipe(
		picture: QueuedPicture,
		direction: SwipeDirection
	): boolean | Promise<boolean> {
		if (direction === 'down') {
			return new Promise((settle) => (maybe = { picture, settle }));
		}
		record(picture, DIRECTION_VERDICT[direction], null);
		return true;
	}

	async function record(picture: QueuedPicture, verdict: Verdict, reason: string | null) {
		queue = queue.filter((p) => p.id !== picture.id);
		if (preview) return;

		try {
			const response = await fetch(`/swipe/verdict/${picture.id}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ verdict, reason })
			});
			// 409: already decided (another device) or deck closed meanwhile — nothing to undo.
			if (!response.ok && response.status !== 409) throw new Error(String(response.status));
		} catch {
			queue = [picture, ...queue];
			toast('Could not save that one, try again', 'error');
		}
	}

	function closeMaybe(reason: string | null) {
		if (!maybe) return;
		const { picture, settle } = maybe;
		maybe = null;
		settle(reason !== null);
		if (reason !== null) record(picture, 'maybe', reason);
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
	<SwipeHeader {preview} onhelp={top ? () => (guide = 'help') : undefined} />

	{#if decks.length > 1}
		<div class={preview ? 'pt-3' : ''}>
			<DeckSwitch decks={liveDecks} current={category} />
		</div>
	{/if}

	{#if top}
		<main class="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-5 pt-4 pb-6">
			<div
				class={[
					'relative aspect-[4/5] w-full',
					decks.length > 1
						? 'max-w-[calc((100dvh-20.5rem)*0.8)]'
						: 'max-w-[calc((100dvh-17rem)*0.8)]'
				]}
				aria-live="polite"
			>
				{#each visible as picture (picture.id)}
					<SwipeCard
						bind:this={cards[picture.id]}
						imageUrl={picture.imageUrl}
						alt={meta.label}
						depth={queue.indexOf(picture)}
						onswipe={(direction) => handleSwipe(picture, direction)}
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

			<p class="text-xs text-taupe">{countLabel(category, queue.length)} left</p>
		</main>
	{:else if nextDeck}
		<main class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
			<span class="grid size-16 place-items-center rounded-full bg-rose-soft text-rose">
				<Icon name={CATEGORY_ICON[nextDeck.category]} class="size-8" />
			</span>
			<h1 class="text-3xl italic">Done here</h1>
			<p class="text-taupe">{countLabel(nextDeck.category, nextDeck.pending)} still waiting.</p>
			<a
				href={resolve('/swipe/[category=category]', { category: nextDeck.category })}
				data-sveltekit-replacestate
				class="btn-primary mt-2"
			>
				See them
			</a>
		</main>
	{:else}
		<AllDone {preview} />
	{/if}
</div>

{#if maybe}
	<MaybeSheet
		suggestions={meta.suggestions}
		onsubmit={(reason) => closeMaybe(reason)}
		oncancel={() => closeMaybe(null)}
	/>
{/if}

{#if guide}
	<SwipeGuide mode={guide} {category} onclose={closeGuide} />
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
