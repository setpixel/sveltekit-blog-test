/**
 * KV Cache utility for Cloudflare Workers
 * @param {any} env - Cloudflare Workers environment
 */

export class KVCache {
	constructor(env) {
		this.cache = env.CACHE;
	}

	async get(key) {
		try {
			const cached = await this.cache.get(key);
			if (!cached) return null;
			
			const data = JSON.parse(cached);
			
			// Check if expired
			if (Date.now() > data.expires) {
				await this.cache.delete(key);
				return null;
			}
			
			return data.value;
		} catch (error) {
			console.error('KV cache get error:', error);
			return null;
		}
	}

	async set(key, value, ttlSeconds = 300) {
		try {
			const data = {
				value,
				expires: Date.now() + (ttlSeconds * 1000)
			};
			
			await this.cache.put(key, JSON.stringify(data), {
				expirationTtl: ttlSeconds
			});
		} catch (error) {
			console.error('KV cache set error:', error);
		}
	}

	async delete(key) {
		try {
			await this.cache.delete(key);
		} catch (error) {
			console.error('KV cache delete error:', error);
		}
	}
}
