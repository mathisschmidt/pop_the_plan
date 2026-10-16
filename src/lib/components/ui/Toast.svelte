<script lang="ts" module>
	type Tone = 'info' | 'error';

	let current = $state<{ id: number; text: string; tone: Tone } | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	/** Fire-and-forget notification. One at a time is plenty on a phone. */
	export function toast(text: string, tone: Tone = 'info'): void {
		clearTimeout(timer);
		current = { id: Date.now(), text, tone };
		timer = setTimeout(() => (current = null), 3000);
	}
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6rem)] z-50 flex justify-center px-6"
	aria-live="polite"
>
	{#if current}
		{#key current.id}
			<p
				transition:fly={{ y: 16, duration: 200 }}
				class={[
					'rounded-full px-5 py-3 text-sm shadow-card',
					current.tone === 'error' ? 'bg-rose text-white' : 'bg-ink text-pearl'
				]}
			>
				{current.text}
			</p>
		{/key}
	{/if}
</div>
