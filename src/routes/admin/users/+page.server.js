import { redirect } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server-supabase.js';
import { isAdmin } from '$lib/admin.js';

export async function load({ locals }) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		throw redirect(302, '/');
	}

	try {
		const { data: adminUsers, error } = await supabaseAdmin
			.from('admin_users')
			.select('id, user_id, email, created_at')
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching admin users:', error);
			return { adminUsers: [], error: error.message };
		}

		return { adminUsers: adminUsers || [] };
	} catch (error) {
		console.error('Error in admin users load:', error);
		return { adminUsers: [], error: error.message };
	}
}
