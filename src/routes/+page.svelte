<script>
	import { marked } from 'marked';
	
	let { data } = $props();
</script>

<svelte:head>
	<title>SSR Blog - Home</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Welcome to SSR Blog</h1>
		<p>A modern blog built with SvelteKit, Supabase, and Cloudflare Workers</p>
	</header>

	{#if data.posts && data.posts.length > 0}
		<section class="posts">
			<h2>Latest Posts</h2>
			<div class="posts-grid">
				{#each data.posts as post}
					<article class="post-card">
						<h3><a href="/{post.slug}">{post.title}</a></h3>
						<p class="meta">
							Published on {new Date(post.created_at).toLocaleDateString()}
						</p>
						<div class="excerpt">
							{@html marked(post.excerpt || post.content?.substring(0, 200) + '...')}
						</div>
						<a href="/{post.slug}" class="read-more">Read More →</a>
					</article>
				{/each}
			</div>
		</section>
	{:else}
		<section class="no-posts">
			<h2>No posts yet</h2>
			<p>Check back soon for new content!</p>
		</section>
	{/if}
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	header h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: #333;
	}

	header p {
		font-size: 1.2rem;
		color: #666;
	}

	.posts h2 {
		font-size: 2rem;
		margin-bottom: 2rem;
		color: #333;
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.post-card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}

	.post-card:hover {
		transform: translateY(-2px);
	}

	.post-card h3 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.post-card h3 a {
		color: #333;
		text-decoration: none;
	}

	.post-card h3 a:hover {
		color: #007acc;
	}

	.meta {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.excerpt {
		color: #555;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.read-more {
		color: #007acc;
		text-decoration: none;
		font-weight: 500;
	}

	.read-more:hover {
		text-decoration: underline;
	}

	.no-posts {
		text-align: center;
		padding: 3rem;
		color: #666;
	}

	.no-posts h2 {
		margin-bottom: 1rem;
	}
</style>
