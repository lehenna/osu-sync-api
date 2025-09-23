import { Injectable } from '@nestjs/common';
import { redisClient } from 'src/common/lib/redis';

interface QueueItem {
    id: string;
    userId: string;
    buffer: Buffer;
    filename: string;
    osuFolderPath: string;
    tiemestamp: number;
}

@Injectable()
export class SyncService {
    async addToQueue(data: QueueItem): Promise<string | null> {
        const queueKey = `${data.userId}:${data.filename}:${data.osuFolderPath}`;
        const redisKey = `sync:queue:${queueKey}`;

        const existing = await redisClient.hGetAll(redisKey);
        if (existing.tiemestamp && Number(existing.tiemestamp) >= data.tiemestamp) return null;

        await redisClient.hSet(redisKey, {
            id: data.id,
            userId: data.userId,
            filename: data.filename,
            osuFolderPath: data.osuFolderPath,
            tiemestamp: data.tiemestamp.toString(),
            buffer: data.buffer.toString('base64'),
        });

        return queueKey;
    }

    async listQueue(limit = 20): Promise<QueueItem[]> {
        const keys = await redisClient.keys('sync:queue:*');
        const result: QueueItem[] = [];

        for (const key of keys.slice(0, limit)) {
            const processingKey = key.replace('queue', 'processing');
            const isProcessing = await redisClient.exists(processingKey);
            if (isProcessing) continue;

            await redisClient.set(processingKey, '1', { EX: 60 }); // lock for 60s

            const data = await redisClient.hGetAll(key);
            result.push({
                id: data.id,
                userId: data.userId,
                filename: data.filename,
                osuFolderPath: data.osuFolderPath,
                tiemestamp: Number(data.tiemestamp),
                buffer: Buffer.from(data.buffer, 'base64'),
            });

            await redisClient.del(key); // remove from queue
        }

        return result;
    }

    async finishProcessing(item: QueueItem) {
        const processingKey = `sync:processing:${item.userId}:${item.filename}:${item.osuFolderPath}`;
        await redisClient.del(processingKey);
    }

    async notifyUpload(payload: any) {
        await redisClient.publish(`sync:uploaded`, JSON.stringify(payload));
    }
}
