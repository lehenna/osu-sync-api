import * as fs from 'fs/promises';
import * as path from 'path';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RepositoryFile } from '../repository.schema';
import { ClamAVService } from './clamav.service';
import { v4 as uuidv4 } from 'uuid';
import { calculateHash } from 'src/common/utils/hashing';

@Injectable()
export class RepositoryService {
    constructor(
        @InjectModel(RepositoryFile.name) private repoModel: Model<RepositoryFile>,
        private clamav: ClamAVService,
    ) {}

    async findOne(data: Partial<{ userId: string; fileName: string; osuFolderPath: string }>) {
        return this.repoModel.findOne(data);
    }

    async create(data: Partial<RepositoryFile>) {
        const record = new this.repoModel(data);
        return await record.save();
    }

    async update(id: string, data: Partial<RepositoryFile>) {
        return this.repoModel.findByIdAndUpdate(id, data, { new: true });
    }

    async saveOrCreate(data: Partial<RepositoryFile>) {
        const existing = await this.findOne({
            userId: data.userId,
            fileName: data.fileName,
            osuFolderPath: data.osuFolderPath,
        });

        if (existing) return this.update(existing.id, {
            ...data,
            version: (existing.version || 0) + 1,
            updatedAt: new Date(),
        });

        return this.create(data);
    }

    async createFilePath(buffer: Buffer) {
        const fileHash = calculateHash(buffer);

        const existing = await this.repoModel.findOne({ fileHash });

        if (existing && existing.storagePath) return existing.storagePath;

        const baseDir = '/var/osu-sync/storage';
        await fs.mkdir(baseDir, { recursive: true });
        const filePath = path.join(baseDir, `${uuidv4()}.zip`);
        await fs.writeFile(filePath, buffer);
        return filePath;
    }

    async saveFile(filename: string, base64: string) {
        const buffer = Buffer.from(base64, 'base64');

        const scan = await this.clamav.scanBuffer(buffer, filename);

        let storagePath = 'not_saved';

        if (scan.clean) storagePath = await this.createFilePath(buffer);

        return storagePath;
    }

    async getFileBuffer(storagePath: string) {
        try {
            return await fs.readFile(storagePath);
        } catch {
            return null;
        }
    }

    async listFiles(userId: string): Promise<RepositoryFile[]> {
        return this.repoModel.find({ userId });
    }
}
