import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ClamAVService {
    async scanBuffer(buffer: Buffer, filename: string): Promise<{
        clean: boolean;
        details: string;
    }> {
        const tempPath = path.join('/tmp', `${Date.now()}-${filename}`);
        await fs.writeFile(tempPath, buffer);

        try {
            const { stdout } = await execAsync(`clamscan ${tempPath}`);
            await fs.unlink(tempPath);

            const clean = stdout.includes('OK');
            return { clean, details: stdout };
        } catch (error) {
            await fs.unlink(tempPath).catch(() => null);
            return { clean: false, details: error.message };
        }
    }
}
