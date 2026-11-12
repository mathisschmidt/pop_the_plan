<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	let { size = 'md', icon = 'ring' }: { size?: 'md' | 'lg'; icon?: IconName } = $props();
</script>

<div class="flex items-center gap-2 text-ink">
	<span
		class={[
			'grid place-items-center rounded-full bg-rose-soft text-rose',
			size === 'lg' ? 'size-14' : 'size-8'
		]}
	>
		<Icon name={icon} class={size === 'lg' ? 'size-7' : 'size-4'} />
	</span>
	<span class={['font-serif italic', size === 'lg' ? 'text-4xl' : 'text-xl']}>Pop the Plan</span>
</div>
