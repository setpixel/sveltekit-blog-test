<script>
	import { supabase } from '$lib/supabase.js';
	import { onMount } from 'svelte';
	
	let user = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		user = session?.user;
		loading = false;

		supabase.auth.onAuthStateChange((event, session) => {
			user = session?.user;
		});
	});

	async function signOut() {
		await supabase.auth.signOut();
		user = null;
	}
</script>

<svelte:head>
	<title>SSR Blog - Home</title>
</svelte:head>

<h1>Welcome to SSR Blog</h1>

{#if loading}
	<p>Loading...</p>
{:else if user}
	<div class="user-info">
		<p>Welcome back, <strong>{user.email}</strong>!</p>
		<button on:click={signOut} class="sign-out-btn">Sign Out</button>
	</div>
{:else}
	<div class="auth-links">
		<p>Please <a href="/auth/login">login</a> or <a href="/auth/signup">sign up</a> to continue.</p>
	</div>
{/if}

<style>
	.user-info {
		background: #f0f8ff;
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sign-out-btn {
		background: #ff4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.sign-out-btn:hover {
		background: #cc3333;
	}

	.auth-links {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 8px;
		margin: 1rem 0;
	}

	.auth-links a {
		color: #007acc;
		text-decoration: none;
		font-weight: 500;
	}

	.auth-links a:hover {
		text-decoration: underline;
	}
</style>
