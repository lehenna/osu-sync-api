import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services/user.service';
import { SessionService } from 'src/user/services/session.service';
import { DeviceService } from 'src/user/services/device.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private sessionService: SessionService,
        private deviceService: DeviceService,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (isPublic) return true;

        const req = context.switchToHttp().getRequest<Request>();
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer '))
            throw new UnauthorizedException('Token missing');

        const token = authHeader.split(' ')[1];
        let payload: any;

        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.userService.findById(payload.sub);
        if (!user) throw new UnauthorizedException('User not found');

        req.user = user;

        if (payload.sessionId) {
            const session = await this.sessionService.findById(payload.sessionId);
            if (!session)
                throw new UnauthorizedException('Session not found');

            if (session.deviceId) {
                const device = await this.deviceService.findById(session.deviceId);
                if (device) req.device = device;
            }
        }

        return true;
    }
}
