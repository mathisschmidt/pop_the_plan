<script lang="ts" module>
	const PATHS = {
		heart:
			'M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z',
		x: 'M6 6l12 12M18 6 6 18',
		question: 'M9.2 9.2a2.9 2.9 0 1 1 4.1 2.6c-.8.4-1.3 1.1-1.3 2v.4M12 17.6v.1',
		help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.7v.3M12 16.6v.1',
		ring: 'M12 21a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM12 8l-2.5-3 1-1.5h3l1 1.5L12 8Z',
		plus: 'M12 5v14M5 12h14',
		trash: 'M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5h10L18 7M9 7V4.5h6V7',
		undo: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
		upload: 'M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 15v4.5h15V15',
		link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
		settings:
			'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7.7 7.7 0 0 1-2.1 1.2l-.3 2h-4l-.3-2a7.7 7.7 0 0 1-2.1-1.2l-1.9.7-2-3.4 1.6-1.2a7.6 7.6 0 0 1 0-3L2.4 9.3l2-3.4 1.9.7a7.7 7.7 0 0 1 2.1-1.2l.3-2h4l.3 2a7.7 7.7 0 0 1 2.1 1.2l1.9-.7 2 3.4-1.6 1.2a7.6 7.6 0 0 1 0 3Z',
		home: 'M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z',
		logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
		rotate: 'M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5',
		eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
		sparkle: 'M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6Z'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		class?: string;
		filled?: boolean;
		strokeWidth?: number;
	}

	let { name, class: className = 'size-5', filled = false, strokeWidth = 1.75 }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	class={className}
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={PATHS[name]} />
</svg>
