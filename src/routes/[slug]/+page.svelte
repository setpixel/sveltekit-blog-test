<script>
	import { renderMarkdownWithComponents } from '$lib/markdown-components';
	import ComponentHydrator from '$lib/markdown-components/ComponentHydrator.svelte';
	
	let { data } = $props();
	
	// Render markdown with components immediately for SSR
	let renderedResult;
	try {
		renderedResult = renderMarkdownWithComponents(data.post.content);
	} catch (error) {
		console.error('Error rendering markdown:', error);
		// Fallback to basic HTML if custom renderer fails
		renderedResult = { 
			html: `<div class="error">Error rendering content</div>`, 
			clientComponents: [] 
		};
	}
	
	// Extract the results
	const renderedContent = renderedResult.html;
	const clientComponents = renderedResult.clientComponents;
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
			{@html renderedContent}
		</div>

		<footer class="post-footer">
			<a href="/" class="back-link">← Back to Home</a>
		</footer>
	</article>
</div>

<!-- Hydrate client-side components -->
{#if clientComponents.length > 0}
	<ComponentHydrator components={clientComponents} />
{/if}

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

	/* Add styles for markdown components */
	.post-content :global(.markdown-section) {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.post-content :global(.section-title) {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2c3e50;
		font-size: 1.4rem;
	}

	.post-content :global(.section-content) {
		color: #34495e;
	}
	
	/* Alert styles */
	.post-content :global(.markdown-alert) {
		padding: 1rem;
		border-radius: 6px;
		margin: 1.5rem 0;
		border: 1px solid;
	}
	
	.post-content :global(.alert-info) {
		background-color: #e3f2fd;
		border-color: #2196f3;
		color: #1565c0;
	}
	
	.post-content :global(.alert-warning) {
		background-color: #fff3e0;
		border-color: #ff9800;
		color: #e65100;
	}
	
	.post-content :global(.alert-error) {
		background-color: #ffebee;
		border-color: #f44336;
		color: #c62828;
	}
	
	.post-content :global(.alert-success) {
		background-color: #e8f5e9;
		border-color: #4caf50;
		color: #2e7d32;
	}
	
	.post-content :global(.alert-title) {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	/* Card styles */
	.post-content :global(.markdown-card) {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.25rem;
		margin: 1rem 0;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.post-content :global(.markdown-card.primary) {
		border-color: #2196f3;
		background: #e3f2fd;
	}
	
	.post-content :global(.card-title) {
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #2c3e50;
	}
	
	.post-content :global(.card-content) {
		color: #555;
	}

	/* YearsAgo styles */
	.post-content :global(.years-ago) {
		color: #666;
		font-size: 0.9em;
		font-style: italic;
		background: #f8f9fa;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		border: 1px solid #e9ecef;
	}
	
	.post-content :global(.years-ago.error) {
		color: #dc3545;
		background: #f8d7da;
		border-color: #f5c6cb;
	}
	
	.post-content :global(.years-ago.future) {
		color: #28a745;
		background: #d4edda;
		border-color: #c3e6cb;
	}
	
	.post-content :global(.years-ago.recent) {
		color: #007bff;
		background: #d1ecf1;
		border-color: #bee5eb;
	}
</style>
