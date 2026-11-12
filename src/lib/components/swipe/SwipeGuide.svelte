<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { CATEGORY_META, type Category } from '#lib/domain/category.ts';
	import GestureDemo from './GestureDemo.svelte';
	import type { SwipeDirection } from './swipe.ts';

	interface Props {
		/**
		 * `tour`: first visit, the deck intro then one step per gesture.
		 * `intro`: she knows the gestures, only the new deck's intro.
		 * `help`: a one-page reminder (the "?" button).
		 */
		mode: 'tour' | 'intro' | 'help';
		category: Category;
		onclose: () => void;
	}

	let { mode, category, onclose }: Props = $props();
	const tour = $derived(mode !== 'help');
	const icon = $derived(CATEGORY_ICON[category]);

	const GESTURES: {
		direction: SwipeDirection;
		title: string;
		meaning: string;
		button: IconName;
		tone: string;
	}[] = [
		{
			direction: 'right',
			title: 'Swipe right',
			meaning: 'I love it',
			button: 'heart',
			tone: 'text-rose'
		},
		{
			direction: 'left',
			title: 'Swipe left',
			meaning: 'Not for me',
			button: 'x',
			tone: 'text-taupe'
		},
		{
			direction: 'down',
			title: 'Swipe down',
			meaning: 'Maybe, but… then tell what you would change',
			button: 'question',
			tone: 'text-champagne'
		}
	];

	// Tour: intro, then one step per gesture. Intro mode stops after the first step.
	let step = $state(0);
	const lastStep = $derived(mode === 'intro' ? 0 : GESTURES.length);
	const gesture = $derived(GESTURES[step - 1]);

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onclose();
	}
</script>

<svelte:window {onkeydown} />

<div class="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]" transition:fade={{ duration: 150 }}>
	<button class="absolute inset-0 size-full" aria-label="Close" onclick={onclose}></button>
</div>

<div
	class="fixed inset-x-4 top-1/2 z-50 mx-auto flex max-w-sm -translate-y-1/2 flex-col gap-6 rounded-[2rem] bg-pearl p-6 shadow-card"
	role="dialog"
	aria-modal="true"
	aria-labelledby="guide-title"
	transition:fly={{ y: 24, duration: 220 }}
>
	{#if tour}
		{#key step}
			<div class="flex min-h-72 flex-col items-center justify-center gap-4 text-center" in:fade>
				{#if step === 0}
					<span class="grid size-16 place-items-center rounded-full bg-rose-soft text-rose">
						<Icon name={icon} class="size-8" />
					</span>
					<h2 id="guide-title" class="text-3xl italic">
						{mode === 'intro' ? 'Something new' : 'Welcome'}
					</h2>
					<p class="text-taupe">{CATEGORY_META[category].intro}</p>
				{:else}
					<GestureDemo direction={gesture.direction} {icon} />
					<h2 id="guide-title" class="text-3xl italic">{gesture.title}</h2>
					<p class="text-ink">{gesture.meaning}</p>
					<p class="flex items-center gap-1.5 text-xs text-taupe">
						or tap <Icon
							name={gesture.button}
							class={['size-4', gesture.tone].join(' ')}
							filled={gesture.button === 'heart'}
						/>
					</p>
				{/if}
			</div>
		{/key}

		{#if lastStep > 0}
			<div class="flex justify-center gap-2" aria-hidden="true">
				{#each { length: lastStep + 1 }, i (i)}
					<span
						class={[
							'h-1.5 rounded-full transition-all',
							i === step ? 'w-5 bg-rose' : 'w-1.5 bg-line'
						]}
					></span>
				{/each}
			</div>
		{/if}

		<div class="grid grid-cols-2 gap-3">
			{#if step < lastStep}
				<button class="btn-secondary" onclick={onclose}>Skip</button>
				<button class="btn-primary" onclick={() => step++}>Next</button>
			{:else}
				<button class="btn-primary col-span-2" onclick={onclose}>Let's start</button>
			{/if}
		</div>
	{:else}
		<h2 id="guide-title" class="text-center text-2xl italic">How it works</h2>
		<ul class="flex flex-col gap-4">
			{#each GESTURES as item (item.direction)}
				<li class="flex items-center gap-4">
					<GestureDemo direction={item.direction} size="sm" {icon} />
					<div class="flex-1">
						<p class="font-medium">{item.title}</p>
						<p class="text-sm text-taupe">{item.meaning}</p>
					</div>
					<Icon
						name={item.button}
						class={['size-5', item.tone].join(' ')}
						filled={item.button === 'heart'}
					/>
				</li>
			{/each}
		</ul>
		<p class="text-center text-xs text-taupe">The buttons under the card do the same.</p>
		<button class="btn-primary" onclick={onclose}>Got it</button>
	{/if}
</div>
