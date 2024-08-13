import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as https from 'https';
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
    const data = JSON.stringify(serviceInfo);

    const options = {
      hostname: 'rvx396-3001.csb.app',
      port: 443,
      path: '/discovery/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Service registered successfully');
        } else {
          console.error(`Failed to register service: ${res.statusCode} ${res.statusMessage}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error registering service:', error);
    });

    req.write(data);
    req.end();
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
