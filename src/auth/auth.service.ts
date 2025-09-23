import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SessionService } from 'src/user/services/session.service';
import { UserService } from 'src/user/services/user.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthorizeDto } from './dto/authorize.dto';
import { DeviceService } from 'src/user/services/device.service';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
        private readonly deviceService: DeviceService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already registered');

        const user = await this.userService.create(dto.email, dto.password);

        const session = await this.sessionService.create({
            userId: user.id,
        });

        const token = this.jwtService.sign({
            sub: user.id,
            sessionId: session.id,
        });

        return { token, sessionId: session.id };
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) throw new NotFoundException('User not found');

        const isMatch = await this.userService.matchPassword(dto.password, user.password)
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const session = await this.sessionService.create({
            userId: user.id,
        });

        const token = this.jwtService.sign({
            sub: user.id,
            sessionId: session.id,
        });

        return { token, sessionId: session.id };
    }

    async authorize(user: User, dto: AuthorizeDto) {
        const existing = await this.deviceService.findByUuid(dto.uuid);
        if (existing) throw new ConflictException('DeviceId already registered');

        const device = await this.deviceService.create(dto);

        const session = await this.sessionService.create({
            userId: user.id,
            deviceId: device.id,
        });

        const token = this.jwtService.sign({
            sub: user.id,
            sessionId: session.id,
        });

        return { token, sessionId: session.id };
    }

    async logout(sessionId: string) {
        return this.sessionService.deactivate(sessionId);
    }
}
