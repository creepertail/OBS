// src/member/member.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Member } from './entities/member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
