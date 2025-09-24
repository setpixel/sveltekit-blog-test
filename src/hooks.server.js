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

	// Check if environment variables are available
	if (!supabaseUrl || !supabaseAnonKey) {
		console.warn('Supabase environment variables not set');
		return await resolve(event);
	}

	// Create Supabase client for the request
	const supabaseClient = createServerClient(
		supabaseUrl,
		supabaseAnonKey,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => event.cookies.set(name, value, options));
				}
			}
		}
	);

	// Create admin client for server-side operations (if service key is available)
	let supabaseAdmin = null;
	if (supabaseServiceKey) {
		supabaseAdmin = createServerClient(
			supabaseUrl,
			supabaseServiceKey,
			{
				cookies: {
					getAll() {
						return event.cookies.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value, options }) => event.cookies.set(name, value, options));
					}
				}
			}
		);
	}

	event.locals.supabase = supabaseClient;
	event.locals.supabaseAdmin = supabaseAdmin;

	// Get session
	const { data: { session } } = await supabaseClient.auth.getSession();
	event.locals.session = session;

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});

	return response;
}
