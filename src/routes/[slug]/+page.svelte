<script>
	import { marked } from 'marked';
	
	let { data } = $props();
	
	// Configure marked for better rendering
	marked.setOptions({
		breaks: true,
		gfm: true
	});
</script>

<svelte:head>
	<title>{data.post.title} - SSR Blog</title>
	<meta name="description" content={data.post.content.substring(0, 160)} />
</svelte:head>

<div class="container">
	<article class="post">
		<header class="post-header">
			<h1>{data.post.title}</h1>
			<p class="meta">
				Published on {new Date(data.post.created_at).toLocaleDateString()}
				{#if data.post.updated_at !== data.post.created_at}
					• Updated on {new Date(data.post.updated_at).toLocaleDateString()}
				{/if}
			</p>
		</header>

		<div class="post-content">
			{@html marked(data.post.content)}
		</div>

		<footer class="post-footer">
			<a href="/" class="back-link">← Back to Home</a>
		</footer>
	</article>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.post {
		background: white;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.post-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}

	.post-header h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		color: #333;
		line-height: 1.2;
	}

	.meta {
		color: #666;
		font-size: 1rem;
		margin: 0;
	}

	.post-content {
		color: #333;
		line-height: 1.7;
		font-size: 1.1rem;
	}

	.post-content :global(h1),
	.post-content :global(h2),
	.post-content :global(h3),
	.post-content :global(h4),
	.post-content :global(h5),
	.post-content :global(h6) {
		color: #333;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.post-content :global(h1) { font-size: 2rem; }
	.post-content :global(h2) { font-size: 1.75rem; }
	.post-content :global(h3) { font-size: 1.5rem; }

	.post-content :global(p) {
		margin-bottom: 1.5rem;
	}

	.post-content :global(ul),
	.post-content :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 2rem;
	}

	.post-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.post-content :global(blockquote) {
		border-left: 4px solid #007acc;
		padding-left: 1rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: #555;
	}

	.post-content :global(code) {
		background: #f5f5f5;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 0.9em;
	}

	.post-content :global(pre) {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 5px;
		overflow-x: auto;
		margin: 1.5rem 0;
	}

	.post-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.post-footer {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.back-link {
		color: #007acc;
		text-decoration: none;
		font-weight: 500;
	}

	.back-link:hover {
		text-decoration: underline;
	}
</style>
