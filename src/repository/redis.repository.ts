import { createClient, RedisClientType } from 'redis';

class RedisRepository {
  private client: RedisClientType | null = null;

  private async getClient(): Promise<RedisClientType> {
    if (this.client) return this.client;

    const client = createClient({
      url: process.env.REDIS_URL,
    }) as RedisClientType;

    client.on('error', (err) => {
      console.error('[REDIS] Client error:', err);
    });

    await client.connect();
    console.log('[REDIS] Initialized successfully!');

    this.client = client;
    return this.client;
  }

  async set(
    cacheKey: string,
    payload: Record<string, any>,
    ttlSeconds = 86400,
  ) {
    const client = await this.getClient();
    await client.set(cacheKey, JSON.stringify(payload), {
      expiration: {
        type: 'EX',
        value: ttlSeconds,
      },
    });
  }

  async get(cacheKey: string): Promise<Record<string, any> | null> {
    const client = await this.getClient();
    const data = await client.get(cacheKey);
    return data ? JSON.parse(data) : null;
  }

  async delete(cacheKey: string) {
    const client = await this.getClient();
    await client.del(cacheKey);
  }

  // Only call this when the entire app is shutting down
  async disconnect() {
    if (!this.client) return;
    await this.client.destroy();
    this.client = null;
    console.log('[REDIS] Connection closed.');
  }
}

// Export a single shared instance
export const redisRepository = new RedisRepository();
