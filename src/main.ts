import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Nest clamav scanner')
    .setDescription(
      'NestJS ClamAV Scanner using ClamAV.js for scanning files and streams.',
    )
    .setVersion('1.0')
    .setContact(
      'Bratislava Innovations',
      'https://inovacie.bratislava.sk',
      'inovacie@bratislava.sk',
    )
    .addServer('https://localhost:' + PORT + '/')
    .addServer('https://nest-prisma-template.dev.bratislava.sk/')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.getHttpAdapter().get('/spec-json', (req, res) => res.json(document));

  await app.listen(PORT);
  console.log(`Nest is running on port: ${PORT}`);
}

bootstrap();
