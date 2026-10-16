<script lang="ts">
	import { swipeIntent, swipeProgress, type SwipeDirection } from './swipe';

	interface Props {
		imageUrl: string;
		/** 0 = top card (draggable), 1 = the one peeking behind. */
		depth: number;
		/**
		 * Called once the card has flown away. Resolve `false` to bring it back
		 * (e.g. she cancelled the "maybe" sheet or the save failed).
		 */
		onswipe: (direction: SwipeDirection) => boolean | Promise<boolean>;
	}

	let { imageUrl, depth, onswipe }: Props = $props();

	const FLY_MS = 280;

	let dx = $state(0);
	let dy = $state(0);
	let dragging = $state(false);
	let flying = $state(false);
	let origin: { x: number; y: number } | null = null;

	const interactive = $derived(depth === 0 && !flying);
	const progress = $derived(swipeProgress(dx, dy));
	const transform = $derived(
		depth === 0
			? `translate3d(${dx}px, ${dy}px, 0) rotate(${dx * 0.05}deg)`
			: `translate3d(0, ${depth * 14}px, 0) scale(${1 - depth * 0.05})`
	);

	function onpointerdown(event: PointerEvent) {
		if (!interactive) return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		origin = { x: event.clientX - dx, y: event.clientY - dy };
		dragging = true;
	}

	function onpointermove(event: PointerEvent) {
		if (!origin) return;
		dx = event.clientX - origin.x;
		dy = event.clientY - origin.y;
	}

	function onpointerup() {
		if (!origin) return;
		origin = null;
		dragging = false;

		const direction = swipeIntent(dx, dy);
		if (direction) fling(direction);
		else reset();
	}

	function reset() {
		dx = 0;
		dy = 0;
	}

	/** Animates the card off-screen, then reports the decision. Also used by the action buttons. */
	export async function fling(direction: SwipeDirection): Promise<void> {
		if (!interactive) return;
		flying = true;

		const { innerWidth: w, innerHeight: h } = window;
		if (direction === 'down') {
			dx = dx * 0.3;
			dy = h;
		} else {
			dx = (direction === 'right' ? 1 : -1) * w * 1.3;
			dy = dy + 40;
		}

		await new Promise((resolve) => setTimeout(resolve, FLY_MS));
		const accepted = await onswipe(direction);
		if (!accepted) {
			reset();
			flying = false;
		}
	}
</script>

<div
	class={[
		'absolute inset-0 touch-none overflow-hidden rounded-[2rem] bg-pearl shadow-card select-none',
		interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
	]}
	style:transform
	style:transition={dragging ? 'none' : `transform ${FLY_MS}ms cubic-bezier(.2,.7,.3,1)`}
	{onpointerdown}
	{onpointermove}
	{onpointerup}
	onpointercancel={onpointerup}
	role="presentation"
>
	<img src={imageUrl} alt="Ring" class="size-full object-cover" draggable="false" />

	{#if depth === 0}
		<span class="stamp top-8 left-6 -rotate-12 border-rose text-rose" style:opacity={progress.right}
			>Love</span
		>
		<span
			class="stamp top-8 right-6 rotate-12 border-taupe text-taupe"
			style:opacity={progress.left}>Nope</span
		>
		<span
			class="stamp bottom-10 left-1/2 -translate-x-1/2 border-champagne text-champagne"
			style:opacity={progress.down}>Maybe…</span
		>
	{/if}
</div>

<style>
	.stamp {
		position: absolute;
		border-width: 3px;
		border-radius: 0.75rem;
		padding: 0.25rem 0.75rem;
		background: rgb(252 250 246 / 0.85);
		font-family: var(--font-serif);
		font-size: 1.75rem;
		font-style: italic;
		pointer-events: none;
	}
</style>
