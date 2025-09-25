import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';
import { isAdmin } from '$lib/admin.js';
import { KVCache } from '$lib/kv-cache.js';

export async function PUT({ params, request, locals, platform }) {
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const { title, content, slug, published, visible_in_listing, status } = await request.json();

		if (!title || !content || !slug) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Check if post exists and belongs to user
		const { data: existingPost, error: fetchError } = await supabaseAdmin
			.from('posts')
			.select('id, author_id, slug')
			.eq('id', params.id)
			.eq('author_id', locals.user.id)
			.single();

		if (fetchError || !existingPost) {
			return json({ error: 'Post not found' }, { status: 404 });
		}

		// Update the post
		const { data, error } = await supabaseAdmin
			.from('posts')
			.update({
				title,
				content,
				slug,
				published: published || false,
				visible_in_listing: visible_in_listing !== false,
				status: status || 'published',
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id)
			.eq('author_id', locals.user.id)
			.select()
			.single();

		if (error) {
			console.error('Error updating post:', error);
			return json({ error: 'Failed to update post' }, { status: 500 });
		}

		// Clear cache for this post (both old and new slug)
		if (platform?.env?.CACHE) {
			const cache = new KVCache(platform.env);
			await cache.delete(`post-${existingPost.slug}`); // Clear old slug cache
			await cache.delete(`post-${slug}`); // Clear new slug cache
			await cache.delete('homepage-posts'); // Clear homepage cache
			console.log('Cache invalidated for post:', existingPost.slug, 'and', slug);
		}

		return json({ success: true, post: data });
	} catch (error) {
		console.error('Error in PUT /api/posts/[id]:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE({ params, locals, platform }) {
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		// Check if post exists and belongs to user
		const { data: existingPost, error: fetchError } = await supabaseAdmin
			.from('posts')
			.select('id, author_id, slug')
			.eq('id', params.id)
			.eq('author_id', locals.user.id)
			.single();

		if (fetchError || !existingPost) {
			return json({ error: 'Post not found' }, { status: 404 });
		}

		// Delete the post
		const { error } = await supabaseAdmin
			.from('posts')
			.delete()
			.eq('id', params.id)
			.eq('author_id', locals.user.id);

		if (error) {
			console.error('Error deleting post:', error);
			return json({ error: 'Failed to delete post' }, { status: 500 });
		}

		// Clear cache for deleted post
		if (platform?.env?.CACHE) {
			const cache = new KVCache(platform.env);
			await cache.delete(`post-${existingPost.slug}`);
			await cache.delete('homepage-posts');
			console.log('Cache invalidated for deleted post:', existingPost.slug);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error in DELETE /api/posts/[id]:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
