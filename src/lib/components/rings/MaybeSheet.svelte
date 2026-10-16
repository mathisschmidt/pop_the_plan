<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { REASON_MAX_LENGTH } from '#lib/domain/ring.ts';

	interface Props {
		onsubmit: (reason: string) => void;
		oncancel: () => void;
	}

	let { onsubmit, oncancel }: Props = $props();

	const SUGGESTIONS = [
		'Stone too big',
		'Stone too small',
		'Not my metal',
		'Too flashy',
		'Band too thick'
	];

	let reason = $state('');
	const trimmed = $derived(reason.trim());

	function addSuggestion(text: string) {
		reason = trimmed ? `${trimmed}, ${text.toLowerCase()}` : text;
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (trimmed) onsubmit(trimmed);
	}
</script>

<div class="fixed inset-0 z-40 bg-ink/30" transition:fade={{ duration: 150 }}>
	<button class="absolute inset-0 size-full" aria-label="Cancel" onclick={oncancel}></button>
</div>

<form
	class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col gap-4 rounded-t-[2rem] bg-pearl px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-card"
	transition:fly={{ y: 300, duration: 250 }}
	onsubmit={submit}
	aria-label="Maybe, but…"
>
	<div class="mx-auto h-1 w-10 rounded-full bg-line"></div>
	<h2 class="text-2xl italic">Maybe, but…</h2>

	<div class="flex flex-wrap gap-2">
		{#each SUGGESTIONS as suggestion (suggestion)}
			<button
				type="button"
				class="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-taupe active:bg-champagne-soft"
				onclick={() => addSuggestion(suggestion)}>{suggestion}</button
			>
		{/each}
	</div>

	<label class="sr-only" for="reason">What bothers you?</label>
	<!-- svelte-ignore a11y_autofocus -->
	<textarea
		id="reason"
		class="textarea"
		placeholder="What would make it perfect?"
		maxlength={REASON_MAX_LENGTH}
		bind:value={reason}
		autofocus></textarea>

	<div class="grid grid-cols-2 gap-3">
		<button type="button" class="btn-secondary" onclick={oncancel}>Cancel</button>
		<button type="submit" class="btn-primary" disabled={!trimmed}>Send</button>
	</div>
</form>
