<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase.js';

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();
		
		if (error) {
			console.error('Auth error:', error);
			goto('/auth/login?error=Authentication failed');
		} else if (data.session) {
			goto('/');
		} else {
			goto('/auth/login');
		}
	});
</script>

<svelte:head>
	<title>Authenticating...</title>
</svelte:head>

<div class="loading-container">
	<div class="spinner"></div>
	<p>Authenticating...</p>
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #007acc;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	p {
		color: #666;
		margin: 0;
	}
</style>
