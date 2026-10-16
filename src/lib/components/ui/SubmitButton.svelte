<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		pending?: boolean;
		variant?: 'primary' | 'secondary' | 'danger';
		class?: string;
		formaction?: string;
		children: Snippet;
	}

	let {
		pending = false,
		variant = 'primary',
		class: className = '',
		formaction,
		children
	}: Props = $props();
</script>

<button type="submit" class={[`btn-${variant}`, className]} disabled={pending} {formaction}>
	{#if pending}
		<span class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
		></span>
	{/if}
	{@render children()}
</button>
