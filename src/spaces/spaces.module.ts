import { Module } from '@nestjs/common';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { SupabaseModule } from '../providers/supabase/supabase.module';
import { CloudflareModule } from 'src/providers/cloudflare/cloudflare.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SupabaseModule, CloudflareModule, ConfigModule],
  controllers: [SpacesController],
  providers: [SpacesService],
})
export class SpacesModule {}