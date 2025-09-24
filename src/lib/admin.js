import { supabaseAdmin } from './server-supabase.js';

/**
 * Check if a user is an admin
 * @param {Object} user - The user object from Supabase auth
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function isAdmin(user) {
	if (!user?.id) return false;
	
	try {
		const { data, error } = await supabaseAdmin
			.from('admin_users')
			.select('id')
			.eq('user_id', user.id)
			.single();
			
		return !error && !!data;
	} catch (error) {
		console.error('Error checking admin status:', error);
		return false;
	}
}

/**
 * Add a user as admin
 * @param {string} userId - The user ID to make admin
 * @param {string} email - The user's email
 * @param {string} createdBy - The admin user ID who is creating this admin
 * @returns {Promise<Object>} - Result object
 */
export async function addAdmin(userId, email, createdBy) {
	try {
		const { data, error } = await supabaseAdmin
			.from('admin_users')
			.insert({
				user_id: userId,
				email: email,
				created_by: createdBy
			})
			.select()
			.single();
			
		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Error adding admin:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Remove a user from admin
 * @param {string} userId - The user ID to remove from admin
 * @returns {Promise<Object>} - Result object
 */
export async function removeAdmin(userId) {
	try {
		const { error } = await supabaseAdmin
			.from('admin_users')
			.delete()
			.eq('user_id', userId);
			
		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Error removing admin:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Get all admin users
 * @returns {Promise<Array>} - Array of admin users
 */
export async function getAdminUsers() {
	try {
		const { data, error } = await supabaseAdmin
			.from('admin_users')
			.select('id, user_id, email, created_at')
			.order('created_at', { ascending: false });
			
		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Error fetching admin users:', error);
		return { success: false, error: error.message };
	}
}
