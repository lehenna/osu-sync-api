import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Session extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop()
    deviceId?: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);