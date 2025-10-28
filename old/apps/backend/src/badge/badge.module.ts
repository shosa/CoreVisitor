import { Global, Module } from '@nestjs/common';
import { BadgeService } from './badge.service';

@Global()
@Module({
  providers: [BadgeService],
  exports: [BadgeService],
})
export class BadgeModule {}
