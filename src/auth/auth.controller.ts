import {
    Controller,
    Post,
    Body,
    Delete,
    Param,
    Get,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { createSuccessResponse } from 'src/common/utils/response';
import { IsPublic } from 'src/common/decorators/is-public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @IsPublic()
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const result = await this.authService.register(dto);
        return createSuccessResponse('User created', result);
    }

    @IsPublic()
    @Post('login')
    async login(@Body() dto: LoginDto) {
        const result = await this.authService.login(dto);
        return createSuccessResponse('User authenticated', result);
    }

    @Delete('sessions/:sessionId')
    async logout(@Param('sessionId') sessionId: string) {
        const success = await this.authService.logout(sessionId);
        if (!success) {
            throw new UnauthorizedException('Sesión not found');
        }
        return createSuccessResponse('Session closed', null);
    }
}
