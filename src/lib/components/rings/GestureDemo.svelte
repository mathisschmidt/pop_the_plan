<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { SwipeDirection } from './swipe.ts';

	interface Props {
		direction: SwipeDirection;
		size?: 'sm' | 'lg';
	}

	let { direction, size = 'lg' }: Props = $props();

	const MOTION: Record<SwipeDirection, { dx: string; dy: string; rot: string; stamp: string }> = {
		right: { dx: '55%', dy: '4%', rot: '12deg', stamp: 'var(--color-rose)' },
		left: { dx: '-55%', dy: '4%', rot: '-12deg', stamp: 'var(--color-taupe)' },
		down: { dx: '0%', dy: '40%', rot: '0deg', stamp: 'var(--color-champagne)' }
	};
	const motion = $derived(MOTION[direction]);
</script>

<!-- A miniature card that loops through the gesture, so she sees the move instead of reading it. -->
<div
	class={['relative grid shrink-0 place-items-center', size === 'lg' ? 'h-40 w-56' : 'h-14 w-16']}
	aria-hidden="true"
>
	<div
		class={[
			'demo grid aspect-[4/5] place-items-center border border-line bg-pearl text-champagne shadow-card motion-reduce:animate-none',
			size === 'lg' ? 'h-32 rounded-2xl' : 'h-11 rounded-lg'
		]}
		style:--dx={motion.dx}
		style:--dy={motion.dy}
		style:--rot={motion.rot}
		style:--stamp={motion.stamp}
		style:--amp={size === 'lg' ? 1 : 0.45}
	>
		<Icon name="ring" class={size === 'lg' ? 'size-10' : 'size-5'} />
	</div>
</div>

<style>
	.demo {
		animation: gesture 2.2s cubic-bezier(0.45, 0, 0.25, 1) infinite;
	}

	@keyframes gesture {
		0%,
		15% {
			transform: translate(0, 0) rotate(0);
			border-color: var(--color-line);
		}
		50%,
		65% {
			transform: translate(calc(var(--dx) * var(--amp)), calc(var(--dy) * var(--amp)))
				rotate(calc(var(--rot) * var(--amp)));
			border-color: var(--stamp);
			opacity: 0.85;
		}
		100% {
			transform: translate(0, 0) rotate(0);
			border-color: var(--color-line);
		}
	}
</style>
