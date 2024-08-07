import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import axios from 'axios';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API First Service')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth() // JWT認証のための設定を追加
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule],
  });
  SwaggerModule.setup('api', app, document);

  const serviceInfo = {
    name: 'test',
    host: `https://${os.hostname()}-3000.csb.app`,
    port: 3000,
  };
  console.log(`https://${os.hostname()}-3000.csb.app`);
  try {
    // ディスカバリサービスに登録
    await axios.post(
      'https://rvx396-3001.csb.app/discovery/register',
      serviceInfo,
    );
    console.log('Service registered successfully');
  } catch (error) {
    console.error('Error registering service:', error);
  }

  // CORS設定を追加
  app.enableCors({
    origin: '*', // 全てのオリジンを許可（必要に応じて特定のオリジンに変更）
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  await app.listen(3000);
}
bootstrap();
