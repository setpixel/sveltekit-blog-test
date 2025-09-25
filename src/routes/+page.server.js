import { supabaseAdmin } from '$lib/server-supabase.js';
import { KVCache } from '$lib/kv-cache.js';

export async function load({ setHeaders, platform }) {
	try {
		// Check if we're in production (Cloudflare Workers) or development
		const isProduction = !!platform?.env?.CACHE;
		
		if (isProduction) {
			// Production: Use KV caching
			const cache = new KVCache(platform.env);
			const cacheKey = 'homepage-posts';
			
			// Check KV cache first
			const cached = await cache.get(cacheKey);
			if (cached) {
				setHeaders({
					'Cache-Control': 'public, max-age=3000', // 5 minutes
					'X-Cache': 'KV-HIT'
				});
				console.log('Posts loaded from KV cache');
				return { posts: cached };
			}

			// Set cache headers for cache miss
			setHeaders({
				'Cache-Control': 'public, max-age=60', // 1 minute
				'X-Cache': 'KV-MISS'
			});
		} else {
			// Development: Just set basic cache headers
			setHeaders({
				'Cache-Control': 'public, max-age=30',
				'X-Cache': 'DEV-MODE'
			});
		}

		console.log('Testing Supabase connection...');
		
		// Simple test query with better error handling
		const { data, error } = await supabaseAdmin
			.from('posts')
			.select('count')
			.limit(1);

		console.log('Supabase test result:', { 
			data, 
			error: error ? {
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code,
				status: error.status,
				statusText: error.statusText
			} : null
		});

		if (error) {
			console.error('Supabase connection failed:', error);
			return { posts: [] };
		}

		// Only fetch posts that are published and visible in listing
		const { data: posts, error: postsError } = await supabaseAdmin
			.from('posts')
			.select('id, title, slug, excerpt, content, created_at')
			.eq('published', true)
			.eq('visible_in_listing', true)
			.eq('status', 'published')
			.order('created_at', { ascending: false })
			.limit(10);

		if (postsError) {
			console.error('Posts query failed:', postsError);
			return { posts: [] };
		}

		console.log('Posts fetched successfully:', posts.length);

		// Cache the result in KV (only in production)
		if (isProduction) {
			const cache = new KVCache(platform.env);
			await cache.set('homepage-posts', posts, 3000); // Cache for 5 minutes
		}

		return { posts };
	} catch (error) {
		console.error('Error in home load:', error);
		return { posts: [] };
	}
}
