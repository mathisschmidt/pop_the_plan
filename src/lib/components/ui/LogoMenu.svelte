<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon, { type IconName } from './Icon.svelte';
	import Logo from './Logo.svelte';

	interface Props {
		/** Shown in the logo: what is currently selected. */
		icon: IconName;
		/** Screen-reader label of the button, e.g. "Working on: Dresses. Change". */
		label: string;
		/** Small caps line on top of the menu. */
		heading: string;
		/** The rows (see `MenuRow`); `close` hides the menu. */
		children: Snippet<[close: () => void]>;
	}

	let { icon, label, heading, children }: Props = $props();
	let expanded = $state(false);
	let root = $state<HTMLElement>();

	const close = () => (expanded = false);

	function onclick(event: MouseEvent) {
		if (expanded && root && !root.contains(event.target as Node)) close();
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
</script>

<svelte:window {onclick} {onkeydown} />

<!-- The logo doubles as a switch: its icon shows the current deck, a tap lists the others. -->
<div class="relative" bind:this={root}>
	<button
		class="-mx-1 flex items-center gap-1 rounded-full px-1 py-1 active:bg-line"
		aria-haspopup="true"
		aria-expanded={expanded}
		aria-controls="logo-menu"
		onclick={() => (expanded = !expanded)}
	>
		<Logo {icon} />
		<span class="sr-only">{label}</span>
		<Icon
			name="chevron"
			class={['size-4 text-taupe transition-transform', expanded && 'rotate-180'].join(' ')}
		/>
	</button>

	{#if expanded}
		<div
			id="logo-menu"
			class="absolute top-full left-0 z-40 mt-2 w-64 rounded-3xl border border-line bg-pearl p-2 shadow-card"
			transition:fly={{ y: -8, duration: 150 }}
		>
			<p class="px-3 pt-1 pb-1 text-xs font-medium tracking-wide text-taupe uppercase">
				{heading}
			</p>
			{@render children(close)}
		</div>
	{/if}
</div>
