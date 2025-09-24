import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), '');
	
	// Convert all env variables to process.env format
	const defineEnv = {};
	for (const [key, value] of Object.entries(env)) {
		defineEnv[`process.env.${key}`] = JSON.stringify(value);
	}
	
	return {
		plugins: [sveltekit()],
		define: defineEnv
	};
});
