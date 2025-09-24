<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>Admin - SSR Blog</title>
</svelte:head>

<h1>Admin Dashboard</h1>

<div class="admin-actions">
	<a href="/admin/posts/new" class="btn btn-primary">Create New Post</a>
</div>

<h2>Your Posts</h2>

{#if data.posts && data.posts.length > 0}
	<div class="posts-list">
		{#each data.posts as post}
			<div class="post-item">
				<div class="post-info">
					<h3><a href="/posts/{post.slug}">{post.title}</a></h3>
					<p class="meta">
						Created: {new Date(post.created_at).toLocaleDateString()}
						{#if post.updated_at !== post.created_at}
							• Updated: {new Date(post.updated_at).toLocaleDateString()}
						{/if}
					</p>
				</div>
				<div class="post-actions">
					<a href="/admin/posts/{post.id}/edit" class="btn btn-secondary">Edit</a>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p>No posts yet. <a href="/admin/posts/new">Create your first post</a>!</p>
{/if}

<style>
	.admin-actions {
		margin: 2rem 0;
	}

	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		text-decoration: none;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.btn-primary {
		background: #007acc;
		color: white;
	}

	.btn-primary:hover {
		background: #005999;
	}

	.btn-secondary {
		background: #666;
		color: white;
	}

	.btn-secondary:hover {
		background: #555;
	}

	.posts-list {
		margin-top: 2rem;
	}

	.post-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-bottom: 1rem;
		background: white;
	}

	.post-info h3 {
		margin: 0 0 0.5rem 0;
	}

	.post-info h3 a {
		color: #333;
		text-decoration: none;
	}

	.post-info h3 a:hover {
		color: #007acc;
	}

	.meta {
		color: #666;
		font-size: 0.9rem;
		margin: 0;
	}

	.post-actions {
		display: flex;
		gap: 0.5rem;
	}
</style>