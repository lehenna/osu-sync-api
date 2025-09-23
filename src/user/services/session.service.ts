import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../schemas/session.schema';
import { Model } from 'mongoose';

@Injectable()
export class SessionService {
    constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) {}

    async create(data: Partial<Session>): Promise<Session> {
        return this.sessionModel.create(data);
    }

    async deactivate(sessionId: string): Promise<boolean> {
        const session = await this.sessionModel.findById(sessionId);
        if (!session) return false;
        await this.sessionModel.findByIdAndDelete(sessionId);
        return true;
    }

    async findByUser(userId: string): Promise<Session[]> {
        return this.sessionModel.find({ userId, active: true });
    }

    async findById(sessionId: string): Promise<Session | null> {
        return this.sessionModel.findById(sessionId);
    }
}
