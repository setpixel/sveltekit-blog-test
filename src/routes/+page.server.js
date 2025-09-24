import { supabaseAdmin } from '$lib/server-supabase.js';
import { KVCache } from '$lib/kv-cache.js';

export async function load({ setHeaders, platform }) {
	try {
		// Check if we're in production (Cloudflare Workers) or development
		const isProduction = !!platform?.env?.CACHE;
		
		console.log('Environment check:', { 
			isProduction, 
			hasPlatform: !!platform, 
			hasCache: !!platform?.env?.CACHE 
		});
		
		if (isProduction) {
			// Production: Use KV caching
			const cache = new KVCache(platform.env);
			const cacheKey = 'homepage-posts';
			
			console.log('Checking KV cache for key:', cacheKey);
			
			// Check KV cache first
			const cached = await cache.get(cacheKey);
			if (cached) {
				console.log('Cache HIT for:', cacheKey);
				setHeaders({
					'Cache-Control': 'public, max-age=300',
					'X-Cache': 'KV-HIT',
					'X-Cache-Key': cacheKey
				});
				return { posts: cached };
			}

			console.log('Cache MISS for:', cacheKey);
			// Set cache headers for cache miss
			setHeaders({
				'Cache-Control': 'public, max-age=300',
				'X-Cache': 'KV-MISS',
				'X-Cache-Key': cacheKey
			});
		} else {
			// Development: Just set basic cache headers
			setHeaders({
				'Cache-Control': 'public, max-age=60',
				'X-Cache': 'DEV-MODE'
			});
		}

		const { data: posts, error } = await supabaseAdmin
			.from('posts')
			.select('id, title, slug, excerpt, created_at')
			.eq('published', true)
			.order('created_at', { ascending: false })
			.limit(10);

		if (error) {
			console.error('Error fetching posts:', error);
			return { posts: [] };
		}

		// Cache the result in KV (only in production)
		if (isProduction) {
			const cache = new KVCache(platform.env);
			console.log('Setting cache for:', 'homepage-posts');
			await cache.set('homepage-posts', posts, 300);
		}

		return { posts };
	} catch (error) {
		console.error('Error in home load:', error);
		return { posts: [] };
	}
}
