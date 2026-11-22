<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import type { RingAuthor } from '#lib/domain/ring.ts';

	interface Props {
		ring: {
			id: string;
			imageUrl: string;
			reason: string | null;
			sourceUrl: string | null;
			addedBy: RingAuthor;
		};
		/** Accessible description of the picture (the deck name). */
		alt: string;
		canReset: boolean;
	}

	let { ring, alt, canReset }: Props = $props();
	// Hers were never in her pile: there is nothing to send back.
	const fromHer = $derived(ring.addedBy === 'guest');
	let busy = $state(false);

	const submit: SubmitFunction = ({ action, cancel }) => {
		if (action.search.includes('delete') && !confirm('Delete this picture for good?')) {
			cancel();
			return;
		}
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'success' && typeof result.data?.message === 'string') {
				toast(result.data.message);
			} else if (result.type === 'failure') {
				toast(String(result.data?.error ?? 'Something went wrong'), 'error');
			}
			await update();
		};
	};
</script>

<article class={['flex flex-col gap-2 transition', busy && 'opacity-50']}>
	<div class="relative">
		<img
			src={ring.imageUrl}
			{alt}
			loading="lazy"
			class="aspect-[4/5] w-full rounded-2xl bg-pearl object-cover"
		/>
		{#if fromHer}
			<span
				class="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-pearl/90 px-2.5 py-1 text-xs text-rose shadow-sm"
			>
				<Icon name="heart" class="size-3" filled /> Added by her
			</span>
		{/if}
	</div>

	{#if ring.reason}
		<p class="rounded-xl bg-champagne-soft px-3 py-2 font-serif text-sm text-ink italic">
			“{ring.reason}”
		</p>
	{/if}

	<form method="POST" class="flex items-center justify-end gap-1" use:enhance={submit}>
		<input type="hidden" name="id" value={ring.id} />
		{#if ring.sourceUrl}
			<!-- eslint-disable svelte/no-navigation-without-resolve -- external shop link -->
			<a
				href={ring.sourceUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="mr-auto grid size-9 place-items-center rounded-full text-taupe active:bg-line"
				aria-label="Open link"
			>
				<Icon name="link" class="size-4" />
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{/if}
		{#if canReset && !fromHer}
			<button
				formaction="?/reset"
				class="grid size-9 place-items-center rounded-full text-taupe active:bg-line"
				aria-label="Send back to review"
				disabled={busy}
			>
				<Icon name="undo" class="size-4" />
			</button>
		{/if}
		<button
			formaction="?/delete"
			class="grid size-9 place-items-center rounded-full text-rose active:bg-rose-soft"
			aria-label="Delete"
			disabled={busy}
		>
			<Icon name="trash" class="size-4" />
		</button>
	</form>
</article>
