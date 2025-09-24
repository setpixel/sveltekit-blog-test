import { createServerClient } from '@supabase/ssr';

export async function handle({ event, resolve }) {
	// Check if we're in development (local) or production (Cloudflare Workers)
	const isDev = !event.locals.runtime;
	
	let supabaseUrl, supabaseAnonKey, supabaseServiceKey;
	
	if (isDev) {
		// Development mode - use environment variables directly
		supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
		supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
		supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	} else {
		// Production mode - use Cloudflare Workers environment
		supabaseUrl = event.locals.runtime.env.PUBLIC_SUPABASE_URL;
		supabaseAnonKey = event.locals.runtime.env.PUBLIC_SUPABASE_ANON_KEY;
		supabaseServiceKey = event.locals.runtime.env.SUPABASE_SERVICE_ROLE_KEY;
	}

	// Create Supabase client with proper cookie handling
	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, options);
				});
			}
		}
	});

	// Get user - this validates the session with Supabase server
	const { data: { user }, error } = await supabase.auth.getUser();
	
	// Create a session object if user exists
	const session = user ? { user } : null;
	
	event.locals.session = session;
	event.locals.user = user;

	return resolve(event);
}
