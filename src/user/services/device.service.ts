import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from '../schemas/device.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeviceService {
    constructor(@InjectModel(Device.name) private deviceModel: Model<Device>) {}

    async create(data: Partial<Device>): Promise<Device> {
        return this.deviceModel.create(data);
    }

    async deactivate(sessionId: string): Promise<boolean> {
        const session = await this.deviceModel.findById(sessionId);
        if (!session) return false;
        await this.deviceModel.findByIdAndDelete(sessionId);
        return true;
    }

    async findByUser(userId: string): Promise<Device[]> {
        return this.deviceModel.find({ userId, active: true });
    }

    async findById(deviceId: string): Promise<Device | null> {
        return this.deviceModel.findById(deviceId);
    }

    async findByUuid(uuid: string): Promise<Device | null> {
        return this.deviceModel.findOne({ uuid });
    }
}
