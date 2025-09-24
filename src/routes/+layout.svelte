<script>
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase.js';
	import { onMount } from 'svelte';
	
	let { children } = $props();
	let session = $state(null);
	let user = $state(null);
	let isUserAdmin = $state(false);

	onMount(async () => {
		const { data: { session: currentSession } } = await supabase.auth.getSession();
		session = currentSession;
		user = currentSession?.user;

		// Check if user is admin
		if (user) {
			try {
				const { data, error } = await supabase
					.from('admin_users')
					.select('id')
					.eq('user_id', user.id)
					.single();
				isUserAdmin = !error && !!data;
			} catch (error) {
				isUserAdmin = false;
			}
		}

		supabase.auth.onAuthStateChange(async (event, session) => {
			session = session;
			user = session?.user;
			
			// Check admin status when auth state changes
			if (user) {
				try {
					const { data, error } = await supabase
						.from('admin_users')
						.select('id')
						.eq('user_id', user.id)
						.single();
					isUserAdmin = !error && !!data;
				} catch (error) {
					isUserAdmin = false;
				}
			} else {
				isUserAdmin = false;
			}
		});
	});

	async function signOut() {
		await supabase.auth.signOut();
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>SSR Blog</title>
	<meta name="description" content="A server-side rendered blog with SvelteKit" />
</svelte:head>

<nav>
	<div class="nav-container">
		<a href="/" class="logo">SSR Blog</a>
		<div class="nav-links">
			<a href="/">Home</a>
			{#if user}
				{#if isUserAdmin}
					<a href="/admin">Admin</a>
					<a href="/admin/posts/new">New Post</a>
					<a href="/admin/upload">Upload Files</a>
				{/if}
				<button on:click={signOut}>Sign Out</button>
			{:else}
				<a href="/auth/login">Login</a>
				<a href="/auth/signup">Sign Up</a>
			{/if}
		</div>
	</div>
</nav>

<main>
	{@render children?.()}
</main>

<style>
	nav {
		background: #333;
		color: white;
		padding: 1rem 0;
		margin-bottom: 2rem;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 1rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: bold;
		text-decoration: none;
		color: white;
	}

	.nav-links {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.nav-links a {
		color: white;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.nav-links a:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.nav-links button {
		background: #ff4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.nav-links button:hover {
		background: #cc3333;
	}

	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}
</style>
