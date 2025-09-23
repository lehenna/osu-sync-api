import type { Request } from 'express';
import {
    Controller,
    Req,
    Get,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { RepositoryService } from './services/repository.service';
import { createSuccessResponse } from 'src/common/utils/response';
import { UploadFileDto } from './dto/upload.dto';
import { SyncService } from './services/sync.service';

@Controller('repository')
export class RepositoryController {
    constructor(private readonly repoService: RepositoryService, private readonly syncService: SyncService) {}

    @Get()
    async listFiles(@Req() req: Request) {
        return createSuccessResponse("Files retrieved successfully", await this.repoService.listFiles(req.user.id));
    }

    @Get('download')
    async downloadFile(dto: { fileName: string; osuFolderPath: string }, @Req() req: Request) {
        if (!req.user) throw new UnauthorizedException('Unauthorized');
        const file = await this.repoService.findOne({
            userId: req.user.id,
            fileName: dto.fileName,
            osuFolderPath: dto.osuFolderPath,
        });
        if (!file || !file.storagePath) return createSuccessResponse("File not found", null);
        const buffer = await this.repoService.getFileBuffer(file.storagePath);
        if (!buffer) return createSuccessResponse("File not found", null);
        return createSuccessResponse("File retrieved successfully", {
            base64: buffer.toString('base64'),
            version: file.version,
            updatedAt: file.updatedAt,
        });
    }

    @Post()
    async uploadFile(dto: UploadFileDto, @Req() req: Request) {
        if (!req.user || !req.device) throw new UnauthorizedException('Unauthorized');
        const id = `upload:${Date.now()}:${req.user.id}:${req.device.id}:${dto.fileName}`
        const queueKey = this.syncService.addToQueue({
            id,
            userId: req.user.id,
            buffer: Buffer.from(dto.base64, 'base64'),
            filename: dto.fileName,
            osuFolderPath: dto.osuFolderPath,
            tiemestamp: dto.timestamp,
        });
        if (!queueKey)
            return createSuccessResponse("File upload skipped, newer or same version already queued", null);
        return createSuccessResponse("File upload queued", { queueKey, id });
    }
}
