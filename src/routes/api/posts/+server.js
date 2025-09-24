import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';

export async function POST({ request, locals }) {
	if (!locals.session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
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
