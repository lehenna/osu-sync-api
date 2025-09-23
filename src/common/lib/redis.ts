import { createClient } from 'redis';

export const redisClient = createClient({
    url: 'redis://localhost:6379',
    database: 1,
});

export const redisSubscriber = redisClient.duplicate();
export const redisPublisher = redisClient.duplicate();

export async function initializeRedis() {
    await redisClient.connect();
    await redisSubscriber.connect();
    await redisPublisher.connect();

    redisClient.on('error', (err) => {
        console.error('[Redis] Error:', err);
    });

    redisClient.on('reconnecting', () => {
        console.warn('[Redis] Reintentando conexión...');
    });

    console.log('[Redis] connected');
}
