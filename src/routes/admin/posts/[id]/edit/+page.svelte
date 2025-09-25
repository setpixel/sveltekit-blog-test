<script>
	import { goto } from '$app/navigation';
	
	let { data } = $props();
	let title = $state(data.post.title);
	let content = $state(data.post.content);
	let slug = $state(data.post.slug);
	let published = $state(data.post.published);
	let visibleInListing = $state(data.post.visible_in_listing);
	let status = $state(data.post.status);
	let loading = $state(false);
	let error = $state('');

	// Auto-generate slug from title
	$effect(() => {
		if (title && !slug) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
	});

	async function handleUpdate() {
		if (!title || !content || !slug) {
			error = 'Please fill in all required fields';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch(`/api/posts/${data.post.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					title, 
					content, 
					slug, 
					published,
					visible_in_listing: visibleInListing,
					status
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to update post');
			}

			goto(`/admin`);
		} catch (err) {
			error = err.message;
		}

		loading = false;
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch(`/api/posts/${data.post.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete post');
			}

			goto('/admin');
		} catch (err) {
			error = err.message;
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Edit Post - Admin</title>
</svelte:head>

<div class="editor-container">
	<h1>Edit Post</h1>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<form onsubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
		<div class="form-group">
			<label for="title">Title</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				required
				disabled={loading}
				placeholder="Enter post title"
			/>
		</div>

		<div class="form-group">
			<label for="slug">Slug</label>
			<input
				id="slug"
				type="text"
				bind:value={slug}
				required
				disabled={loading}
				placeholder="post-url-slug"
			/>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="status">Status</label>
				<select id="status" bind:value={status} disabled={loading}>
					<option value="draft">Draft</option>
					<option value="published">Published</option>
					<option value="archived">Archived</option>
				</select>
			</div>

			<div class="form-group">
				<label>
					<input type="checkbox" bind:checked={published} disabled={loading} />
					Published
				</label>
			</div>

			<div class="form-group">
				<label>
					<input type="checkbox" bind:checked={visibleInListing} disabled={loading} />
					Visible in listing
				</label>
			</div>
		</div>

		<div class="form-group">
			<label for="content">Content (Markdown)</label>
			<textarea
				id="content"
				bind:value={content}
				required
				disabled={loading}
				placeholder="Write your post content in Markdown..."
				rows="20"
			></textarea>
		</div>

		<div class="form-actions">
			<a href="/admin" class="btn btn-secondary">Cancel</a>
			<button type="button" onclick={handleDelete} disabled={loading} class="btn btn-danger">
				Delete Post
			</button>
			<button type="submit" disabled={loading}>
				{loading ? 'Updating...' : 'Update Post'}
			</button>
		</div>
	</form>
</div>

<style>
	.editor-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.editor-container h1 {
		margin-bottom: 2rem;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: 500;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #007acc;
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 400px;
		font-family: 'Monaco', 'Consolas', monospace;
		line-height: 1.5;
	}

	.form-group input[type="checkbox"] {
		width: auto;
		margin-right: 0.5rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		text-decoration: none;
		font-weight: 500;
		transition: background-color 0.2s;
		border: none;
		cursor: pointer;
		font-size: 1rem;
	}

	.btn-secondary {
		background: #666;
		color: white;
	}

	.btn-secondary:hover {
		background: #555;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover {
		background: #c82333;
	}

	button {
		background: #007acc;
		color: white;
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
</style>