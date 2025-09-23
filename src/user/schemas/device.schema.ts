import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Device extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop()
    name: string;

    @Prop()
    ip: string;

    @Prop()
    hostname: string;

    @Prop()
    uuid: string;

    @Prop()
    os: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);