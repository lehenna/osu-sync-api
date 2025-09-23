import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { RepositoryFile, RepositoryFileSchema } from './repository.schema';
import { RepositoryService } from './services/repository.service';
import { ClamAVService } from './services/clamav.service';
import { SyncService } from './services/sync.service';
import { RepositoryGateway } from './repository.gateway';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: RepositoryFile.name, schema: RepositoryFileSchema },
        ]),
        UserModule,
    ],
    providers: [
        RepositoryService,
        ClamAVService,
        SyncService,
        RepositoryGateway,
    ],
    exports: [
        RepositoryService,
        SyncService,
    ],
})
export class RepositoryModule {}
