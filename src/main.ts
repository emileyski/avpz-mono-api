import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  // Increase JSON payload size limit
  app.use(bodyParser.json({ limit: '15mb' }));

  const options = new DocumentBuilder()
    .setTitle('Skillhub backend')
    .setDescription('Skillhub API')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      description: 'Enter access token here',
      bearerFormat: 'Bearer ${token}',
      in: 'header',
      name: 'Authorization',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;

  // Configure CORS
  app.enableCors({
    origin: '*', // Specify the origin of your React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Enable credentials (cookies, authorization headers)
  });

  await app.listen(PORT);
  Logger.log(`💡 Skillhub backend is running on http://localhost:${PORT}`);
  Logger.log(`📚 Swagger is running on http://localhost:${PORT}/api/docs`);
}

bootstrap();
