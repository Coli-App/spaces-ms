import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { EnvConfiguration } from "./common/config/env.config";
import { SportsModule } from './sports/sports.module';
import { SpacesModule } from './spaces/spaces.module';
@Module({
  imports: [
      ConfigModule.forRoot({
      load: [EnvConfiguration],
    }),
    SportsModule,
    SpacesModule,
  ],
})
export class AppModule {}
