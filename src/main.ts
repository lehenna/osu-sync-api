import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeRedis } from './common/lib/redis';

async function bootstrap() {
  await initializeRedis();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error(error);
});
