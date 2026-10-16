<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import GestureDemo from './GestureDemo.svelte';
	import type { SwipeDirection } from './swipe.ts';

	interface Props {
		/** `true` the first time: a step-by-step tour. `false`: a one-page reminder (the "?" button). */
		tour: boolean;
		onclose: () => void;
	}

	let { tour, onclose }: Props = $props();

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

	// Tour: intro, then one step per gesture.
	let step = $state(0);
	const lastStep = GESTURES.length;
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
						<Icon name="ring" class="size-8" />
					</span>
					<h2 id="guide-title" class="text-3xl italic">Welcome</h2>
					<p class="text-taupe">
						A few rings are waiting for you. Tell me honestly what you think of each one, there is
						no wrong answer.
					</p>
				{:else}
					<GestureDemo direction={gesture.direction} />
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
					<GestureDemo direction={item.direction} size="sm" />
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
