<script>
	import { supabase } from '$lib/supabase.js';
	import { goto } from '$app/navigation';
	
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');

	async function handleSignup() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;
		error = '';

		const { error: authError } = await supabase.auth.signUp({
			email,
			password
		});

		if (authError) {
			error = authError.message;
		} else {
			goto('/auth/login?message=Check your email to confirm your account');
		}

		loading = false;
	}

	async function handleGoogleSignup() {
		const { error: authError } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (authError) {
			error = authError.message;
		}
	}
</script>

<svelte:head>
	<title>Sign Up - SSR Blog</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>Sign Up</h1>
		
		{#if error}
			<div class="error">{error}</div>
		{/if}

		<!-- Google Sign Up Button -->
		<button on:click={handleGoogleSignup} class="google-btn">
			<svg class="google-icon" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			Continue with Google
		</button>

		<div class="divider">
			<span>or</span>
		</div>

		<form on:submit|preventDefault={handleSignup}>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm Password</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" disabled={loading}>
				{loading ? 'Signing up...' : 'Sign Up'}
			</button>
		</form>

		<p>
			Already have an account? <a href="/auth/login">Login</a>
		</p>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
		padding: 2rem 1rem;
	}

	.auth-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.auth-card h1 {
		text-align: center;
		margin: 0 0 2rem 0;
		color: #333;
	}

	.google-btn {
		width: 100%;
		background: white;
		color: #333;
		border: 1px solid #ddd;
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: background-color 0.2s;
	}

	.google-btn:hover {
		background: #f5f5f5;
	}

	.google-icon {
		width: 20px;
		height: 20px;
	}

	.divider {
		text-align: center;
		margin: 1rem 0;
		position: relative;
		color: #666;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: #ddd;
	}

	.divider span {
		background: white;
		padding: 0 1rem;
		position: relative;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: 500;
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
	}

	button {
		width: 100%;
		background: #007acc;
		color: white;
		border: none;
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		margin-bottom: 1rem;
		transition: background-color 0.2s;
	}

	button:hover:not(:disabled) {
		background: #005999;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #fcc;
	}

	p {
		text-align: center;
		color: #666;
	}

	a {
		color: #007acc;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
