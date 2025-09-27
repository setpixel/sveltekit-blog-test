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
			
			// Check if invalidated
			if (data.invalidatedAt && Date.now() < data.invalidatedAt + 60000) {
				// Within 60 seconds of invalidation, treat as stale
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
				expires: Date.now() + (ttlSeconds * 1000),
				invalidatedAt: null
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
			// Instead of deleting, mark as invalidated
			const cached = await this.cache.get(key);
			if (cached) {
				const data = JSON.parse(cached);
				data.invalidatedAt = Date.now();
				// Keep it for 60 more seconds to ensure invalidation propagates
				await this.cache.put(key, JSON.stringify(data), {
					expirationTtl: 60
				});
			}
		} catch (error) {
			console.error('KV cache delete error:', error);
		}
	}
	
	// Force immediate invalidation by overwriting with expired data
	async invalidate(key) {
		try {
			const data = {
				value: null,
				expires: Date.now() - 1, // Already expired
				invalidatedAt: Date.now()
			};
			
			await this.cache.put(key, JSON.stringify(data), {
				expirationTtl: 60 // Keep for 60 seconds to ensure propagation
			});
		} catch (error) {
			console.error('KV cache invalidate error:', error);
		}
	}
}
