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
				setHeaders({
					'Cache-Control': 'public, max-age=600',
					'X-Cache': 'KV-HIT'
				});
				return { post: cached };
			}

			// Set cache headers for cache miss
			setHeaders({
				'Cache-Control': 'public, max-age=600',
				'X-Cache': 'KV-MISS'
			});
		} else {
			// Development: Just set basic cache headers
			setHeaders({
				'Cache-Control': 'public, max-age=60',
				'X-Cache': 'DEV-MODE'
			});
		}

		const { data: post, error: postError } = await supabaseAdmin
			.from('posts')
			.select('id, title, content, slug, created_at, updated_at')
			.eq('slug', params.slug)
			.eq('published', true)
			.single();

		if (postError || !post) {
			throw error(404, 'Post not found');
		}

		// Cache the result in KV (only in production)
		if (isProduction) {
			const cache = new KVCache(platform.env);
			await cache.set(`post-${params.slug}`, post, 600);
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
