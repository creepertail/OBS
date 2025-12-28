// src/restrict_user/restrict-user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestrictUserService } from './restrict-user.service';
import { RestrictUserController } from './restrict-user.controller';
import { RestrictUser } from './entities/restrict-user.entity';
import { Member } from '../member/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RestrictUser, Member])],
  controllers: [RestrictUserController],
  providers: [RestrictUserService],
  exports: [RestrictUserService],
})
export class RestrictUserModule {}

