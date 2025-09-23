import { IsNumber, IsString } from 'class-validator';

export class UploadFileDto {
    @IsString()
    fileName: string;

    @IsString()
    base64: string;

    @IsString()
    osuFolderPath: string;

    @IsNumber()
    timestamp: number;
}
