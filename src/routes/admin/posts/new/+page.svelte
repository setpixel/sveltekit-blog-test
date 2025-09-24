<script>
	import { goto } from '$app/navigation';
	
	let title = $state('');
	let content = $state('');
	let slug = $state('');
	let loading = $state(false);
	let error = $state('');

	// Auto-generate slug from title
	$effect(() => {
		if (title) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
	});

	async function handleSubmit() {
		if (!title || !content || !slug) {
			error = 'Please fill in all fields';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ title, content, slug })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to create post');
			}

			const { slug: createdSlug } = await response.json();
			goto(`/posts/${createdSlug}`);
		} catch (err) {
			error = err.message;
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>New Post - Admin</title>
</svelte:head>

<div class="editor-container">
	<h1>Create New Post</h1>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit}>
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
			<button type="submit" disabled={loading}>
				{loading ? 'Creating...' : 'Create Post'}
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

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #333;
		font-weight: 500;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus {
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
