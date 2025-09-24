import { supabaseAdmin } from '$lib/server-supabase.js';
import { KVCache } from '$lib/kv-cache.js';

export async function load({ setHeaders, platform }) {
	try {
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

		// If that works, try the real query
		const { data: posts, error: postsError } = await supabaseAdmin
			.from('posts')
			.select('id, title, slug, excerpt, created_at')
			.eq('published', true)
			.order('created_at', { ascending: false })
			.limit(10);

		if (postsError) {
			console.error('Posts query failed:', postsError);
			return { posts: [] };
		}

		console.log('Posts fetched successfully:', posts.length);
		return { posts };
	} catch (error) {
		console.error('Error in home load:', error);
		return { posts: [] };
	}
}
