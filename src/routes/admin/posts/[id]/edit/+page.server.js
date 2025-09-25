import { redirect, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';
import { isAdmin } from '$lib/admin.js';

export async function load({ params, locals }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		throw redirect(302, '/');
	}

	try {
		const { data: post, error: postError } = await supabaseAdmin
			.from('posts')
			.select('*')
			.eq('id', params.id)
			.eq('author_id', locals.user.id)
			.single();

		if (postError || !post) {
			throw error(404, 'Post not found');
		}

		// Ensure all required fields exist with defaults
		const postWithDefaults = {
			...post,
			published: post.published ?? true,
			visible_in_listing: post.visible_in_listing ?? true,
			status: post.status ?? 'published'
		};

		return { post: postWithDefaults };
	} catch (err) {
		if (err.status === 404) {
			throw err;
		}
		console.error('Error fetching post:', err);
		throw error(500, 'Failed to load post');
	}
}
