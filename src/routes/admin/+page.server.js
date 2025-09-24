import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';

export async function load({ locals }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Only fetch essential fields and limit results for better performance
		const { data: posts, error } = await supabaseAdmin
			.from('posts')
			.select('id, title, slug, created_at, updated_at')
			.eq('author_id', locals.user.id)
			.order('created_at', { ascending: false })
			.limit(20); // Limit to 20 most recent posts

		if (error) {
			console.error('Error fetching posts:', error);
			return { posts: [] };
		}

		return { posts };
	} catch (error) {
		console.error('Error in admin load:', error);
		return { posts: [] };
	}
}