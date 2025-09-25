import { error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';
import { KVCache } from '$lib/kv-cache.js';

export async function load({ params, setHeaders, platform }) {
	try {
		// Check if we're in production (Cloudflare Workers) or development
		const isProduction = !!platform?.env?.CACHE;
		
		if (isProduction) {
			// Production: Use KV caching
			const cache = new KVCache(platform.env);
			const cacheKey = `post-${params.slug}`;
			
			// Check KV cache first
			const cached = await cache.get(cacheKey);
			if (cached) {
				// Create ETag from post update time
				const etag = `"${cached.updated_at || cached.created_at}"`;
				
				setHeaders({
					'Cache-Control': 'public, max-age=3600', // 1 hour
					'ETag': etag,
					'X-Cache': 'KV-HIT'
				});
				console.log('Post loaded from KV cache:', params.slug);
				return { post: cached };
			}

			// Set cache headers for cache miss
			setHeaders({
				'Cache-Control': 'public, max-age=3600', // 1 hour
				'X-Cache': 'KV-MISS'
			});
		} else {
			// Development: Just set basic cache headers
			setHeaders({
				'Cache-Control': 'public, max-age=300', // 5 minutes in dev
				'X-Cache': 'DEV-MODE'
			});
		}

		console.log('Fetching post from database:', params.slug);

		const { data: post, error: postError } = await supabaseAdmin
			.from('posts')
			.select('id, title, content, slug, created_at, updated_at, published, visible_in_listing, status')
			.eq('slug', params.slug)
			.eq('published', true)
			.single();

		console.log('Post query result:', { post: !!post, error: postError });

		if (postError) {
			console.error('Post query error:', postError);
			throw error(404, 'Post not found');
		}

		if (!post) {
			console.log('Post not found:', params.slug);
			throw error(404, 'Post not found');
		}

		// Set ETag based on update time
		const etag = `"${post.updated_at || post.created_at}"`;
		setHeaders({
			'ETag': etag
		});

		// Cache the result in KV (only in production)
		if (isProduction) {
			const cache = new KVCache(platform.env);
			await cache.set(`post-${params.slug}`, post, 10000); // Cache for 1 hour
			console.log('Post cached:', params.slug);
		}

		return { post };
	} catch (err) {
		if (err.status === 404) {
			throw err;
		}
		console.error('Error fetching post:', err);
		throw error(500, 'Failed to load post');
	}
}
