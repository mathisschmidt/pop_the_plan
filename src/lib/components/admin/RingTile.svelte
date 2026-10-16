<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';

	interface Props {
		ring: { id: string; imageUrl: string; reason: string | null; sourceUrl: string | null };
		canReset: boolean;
	}

	let { ring, canReset }: Props = $props();
	let busy = $state(false);

	const submit: SubmitFunction = ({ action, cancel }) => {
		if (action.search.includes('delete') && !confirm('Delete this ring for good?')) {
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
	<img
		src={ring.imageUrl}
		alt="Ring"
		loading="lazy"
		class="aspect-[4/5] w-full rounded-2xl bg-pearl object-cover"
	/>

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
				aria-label="Open source"
			>
				<Icon name="link" class="size-4" />
			</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		{/if}
		{#if canReset}
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
