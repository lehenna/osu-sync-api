import { Socket } from 'socket.io';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from 'src/user/services/session.service';
import { DeviceService } from 'src/user/services/device.service';
import { UserService } from 'src/user/services/user.service';
import { redisSubscriber } from 'src/common/lib/redis';

interface UploadedFilePayload {
    id: string;
    userId: string;
    filename: string;
    osuFolderPath: string;
    timestamp: number;
    status: 'success' | 'error';
    message?: string;
    version?: number;
    storagePath?: string;
}

@WebSocketGateway({ cors: true })
export class RepositoryGateway implements OnGatewayInit {
    private clients: Record<string, Socket[]> = {};

    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
        private readonly deviceService: DeviceService,
        private readonly userService: UserService,
    ) {}

    afterInit(server: any) {
        server.use(async (socket: Socket, next) => {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token || typeof token !== 'string') return next(new Error('Token missing'));

            let payload: any;
            try {
                payload = this.jwtService.verify(token);
            } catch {
                return next(new Error('Invalid token'));
            }

            const session = await this.sessionService.findById(payload.sessionId);
            if (!session || !session.deviceId) return next(new Error('Invalid session'));

            const device = await this.deviceService.findById(session.deviceId);
            if (!device) return next(new Error('Device not found'));

            const user = await this.userService.findById(payload.sub);
            if (!user) return next(new Error('User not found'));

            const userId = user.id;
            const deviceId = device.id;

            socket.data.userId = userId;
            socket.data.deviceId = deviceId;
            socket.data.device = device;
            socket.data.user = user;

            if (!this.clients[userId]) {
                this.clients[userId] = [];
            }

            this.clients[userId].push(socket);
            next();
        });

        redisSubscriber.subscribe('sync:uploaded', (message) => {
            const payload = JSON.parse(message) as UploadedFilePayload;
            for (const s of this.clients[payload.userId] || []) {
                s.emit('sync:uploaded', payload);
            }
        });
    }

    handleDisconnect(socket: Socket) {
        const userId = socket.data?.userId;
        if (!userId) return;
        this.clients[userId] = (this.clients[userId] || []).filter(s => s.id !== socket.id);
    }
}
