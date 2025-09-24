<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Admin Users - SSR Blog</title>
</svelte:head>

<h1>Admin Users</h1>

{#if data.error}
	<div class="error">{data.error}</div>
{:else}
	<div class="admin-users">
		{#each data.adminUsers as admin}
			<div class="admin-user">
				<div class="admin-info">
					<strong>{admin.email}</strong>
					<span class="created">Added: {new Date(admin.created_at).toLocaleDateString()}</span>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.admin-users {
		margin-top: 2rem;
	}
	
	.admin-user {
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-bottom: 1rem;
		background: white;
	}
	
	.admin-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.created {
		color: #666;
		font-size: 0.9rem;
	}
	
	.error {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #fcc;
	}
</style>
