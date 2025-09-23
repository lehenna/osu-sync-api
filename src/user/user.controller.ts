import type { Request } from 'express';
import { Controller, Post, Body, Get, Req, HttpException } from '@nestjs/common';
import { UserService } from './services/user.service';
import { createSuccessResponse } from 'src/common/utils/response';
import { DeviceService } from './services/device.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService, private readonly deviceService: DeviceService) {}

    @Get('profile')
    async getProfile(@Req() req: Request) {
        const user = req.user;
        const userData = {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        }
        return createSuccessResponse("User profile retrieved successfully", userData);
    }

    @Get('device')
    async getDevice(@Req() req: Request) {
        const user = req.user;
        const device = req.device;
        if (!device || device.userId !== user.id)
            throw new HttpException("No device associated with the user", 404);
        const deviceData = {
            name: device.name,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
            ip: device.ip,
            hostname: device.hostname,
            os: device.os,
            createdAt: device.createdAt,
        }
        return createSuccessResponse("User device retrieved successfully", deviceData);
    }

    @Get('devices')
    async listDevices(@Req() req: Request) {
        const userId = req.user.id;
        const devices = await this.deviceService.findByUser(userId);
        return devices.map((device) => ({
            name: device.name,
            ip: device.ip,
            hostname: device.hostname,
            os: device.os,
            createdAt: device.createdAt,
        }));
    }
}
