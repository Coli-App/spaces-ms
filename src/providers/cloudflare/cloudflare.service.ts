import { Inject, Injectable, Logger } from '@nestjs/common';
import { CLOUDFLARE_R2_CLIENT } from './cloudflare.constants';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly bucketName: string;

  constructor(
    @Inject(CLOUDFLARE_R2_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>(
      'CLOUDFLARE_BUCKET_NAME',
    );
  }

  async uploadFile(
    key: string,
    file: Buffer,
    mimeType: string,
  ): Promise<string> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: mimeType,
        }),
      );

      return key;
    } catch (error) {
      this.logger.error(`Error subiendo archivo a R2: ${key}`, error);
      throw error;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 86400 });
      return url;
    } catch (error) {
      this.logger.error(`Error generando URL firmada para: ${key}`, error);
      throw error;
    }
  }
}
