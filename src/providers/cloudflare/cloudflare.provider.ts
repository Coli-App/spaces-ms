import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { CLOUDFLARE_R2_CLIENT } from './cloudflare.constants';

export const CloudflareClientProvider: Provider = {
  provide: CLOUDFLARE_R2_CLIENT,
  useFactory: (configService: ConfigService): S3Client => {
    const accountId = configService.getOrThrow<string>('CLOUDFLARE_ACCOUNT_ID');
    
    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: configService.getOrThrow<string>('CLOUDFLARE_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>('CLOUDFLARE_SECRET_ACCESS_KEY'),
      },
    });
  },
  inject: [ConfigService],
};