import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class RepositoryFile extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    deviceId: string;

    @Prop({ required: true })
    osuFolderPath: string;

    @Prop({ required: true })
    fileName: string;

    @Prop({ default: new Date() })
    updatedAt: Date;

    @Prop({ default: 1 })
    version: number;

    @Prop()
    storagePath?: string;

    @Prop()
    fileSize?: number;

    @Prop()
    fileHash?: string;
}

export const RepositoryFileSchema = SchemaFactory.createForClass(RepositoryFile);
