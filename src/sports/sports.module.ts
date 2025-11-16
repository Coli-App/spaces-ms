import { Module } from '@nestjs/common';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';
import { SupabaseModule } from '../providers/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SportsController],
  providers: [SportsService],
})
export class SportsModule {}