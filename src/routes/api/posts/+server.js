import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';
import { isAdmin } from '$lib/admin.js';

export async function POST({ request, locals }) {
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin using database
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const { title, content, slug } = await request.json();

		if (!title || !content || !slug) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const { data, error } = await supabaseAdmin
			.from('posts')
			.insert({
				title,
				content,
				slug,
				author_id: locals.session.user.id
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating post:', error);
			return json({ error: 'Failed to create post' }, { status: 500 });
		}

		return json({ slug: data.slug });
	} catch (error) {
		console.error('Error in POST /api/posts:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
