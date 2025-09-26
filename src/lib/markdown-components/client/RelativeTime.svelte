<script>
	import { onMount } from 'svelte';
	
	let { date = '' } = $props();
	let relativeTime = $state('');
	let interval;
	
	function updateRelativeTime() {
		const targetDate = new Date(date);
		const now = new Date();
		const diff = now - targetDate;
		
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const months = Math.floor(days / 30);
		const years = Math.floor(days / 365);
		
		if (years > 0) {
			relativeTime = `${years} year${years > 1 ? 's' : ''} ago`;
		} else if (months > 0) {
			relativeTime = `${months} month${months > 1 ? 's' : ''} ago`;
		} else if (days > 0) {
			relativeTime = `${days} day${days > 1 ? 's' : ''} ago`;
		} else if (hours > 0) {
			relativeTime = `${hours} hour${hours > 1 ? 's' : ''} ago`;
		} else if (minutes > 0) {
			relativeTime = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		} else {
			relativeTime = 'just now';
		}
	}
	
	onMount(() => {
		updateRelativeTime();
		// Update every minute
		interval = setInterval(updateRelativeTime, 60000);
		
		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

{#if relativeTime}
	<span class="relative-time" title={new Date(date).toLocaleString()}>
		{relativeTime}
	</span>
{:else}
	<span class="relative-time loading">calculating...</span>
{/if}

<style>
	.relative-time {
		color: #666;
		font-size: 0.9em;
		cursor: help;
	}
	
	.loading {
		opacity: 0.5;
		font-style: italic;
	}
</style>