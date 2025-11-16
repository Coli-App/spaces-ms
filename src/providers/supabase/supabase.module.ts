import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createSupabaseClient, createSupabaseAdminClient } from './supabase';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (configService: ConfigService) => {
        return createSupabaseClient(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'SUPABASE_ADMIN_CLIENT',
      useFactory: (configService: ConfigService) => {
        return createSupabaseAdminClient(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE_CLIENT', 'SUPABASE_ADMIN_CLIENT'],
})
export class SupabaseModule {}
