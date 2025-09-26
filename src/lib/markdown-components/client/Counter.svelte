<script>
	let { start = 0, step = 1 } = $props();
	let count = $state(Number(start));
	
	function increment() {
		count += Number(step);
	}
	
	function decrement() {
		count -= Number(step);
	}
</script>

<div class="counter-widget">
	<button onclick={decrement}>-</button>
	<span class="count">{count}</span>
	<button onclick={increment}>+</button>
</div>

<style>
	.counter-widget {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
	}
	
	button {
		width: 24px;
		height: 24px;
		border: none;
		background: #007acc;
		color: white;
		border-radius: 3px;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	button:hover {
		background: #005999;
	}
	
	.count {
		min-width: 2rem;
		text-align: center;
		font-weight: 600;
		color: #333;
	}
</style>