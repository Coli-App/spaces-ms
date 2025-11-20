import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudflareClientProvider } from './cloudflare.provider';
import { CloudflareService } from './cloudflare.service';

@Module({
    imports: [ConfigModule],
    providers: [CloudflareClientProvider, CloudflareService],
    exports: [CloudflareService],
})
export class CloudflareModule {} 