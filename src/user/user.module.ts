import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { SessionService } from './services/session.service';
import { Device, DeviceSchema } from './schemas/device.schema';
import { DeviceService } from './services/device.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
        MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    ],
    providers: [UserService, SessionService, DeviceService],
    controllers: [UserController],
    exports: [UserService, SessionService, DeviceService],
})
export class UserModule {}
