import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser'; // Import body-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Increase JSON payload size limit
  app.use(bodyParser.json({ limit: '15mb' })); // Adjust the limit as needed

  const options = new DocumentBuilder()
    .setTitle('Skillhub backend')
    .setDescription('Skillhub API')
    .setVersion('1.0')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;

  app.enableCors({ origin: 'http://localhost:5173' });

  await app.listen(PORT);
  Logger.log(`😎 Skillhub API is running on port ${PORT}`, `bootstrap`);
}

bootstrap();
