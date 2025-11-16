import { Module } from '@nestjs/common';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { SupabaseModule } from '../providers/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SpacesController],
  providers: [SpacesService],
})
export class SpacesModule {}