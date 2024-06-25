import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // this will throw errors like { 'property': 'property value' }
      exceptionFactory(errors) {
        const errList = {};

        errors.forEach((error) => {
          errList[error.property] = Object.values(error.constraints);
        });

        throw new BadRequestException({ errors: errList });
      },
    }),
  );

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:5555',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 24 * 60 * 60 * 5,
  };

  app.enableCors(corsOptions);
  await app.listen(3000);
}
bootstrap();
