import { IsEmail, IsString } from 'class-validator';

export class AuthorizeDto {
    @IsString()
    uuid: string;

    @IsString()
    deviceId: string;

    @IsString()
    ip: string;

    @IsString()
    hostname: string;

    @IsString()
    name: string;

    @IsString()
    os: string;
}
