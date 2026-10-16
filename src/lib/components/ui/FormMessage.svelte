<script lang="ts">
	let { result }: { result?: { error?: string; message?: string } } = $props();
</script>

{#if result?.error}
	<p class="error-text" role="alert">{result.error}</p>
{:else if result?.message}
	<p class="text-sm text-taupe" role="status">{result.message}</p>
{/if}
