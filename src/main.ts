import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeRedis } from './common/lib/redis';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  await initializeRedis();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*"
  })
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap().catch((error) => {
  console.error(error);
});
