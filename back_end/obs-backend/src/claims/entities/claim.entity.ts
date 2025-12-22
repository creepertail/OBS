// src/claims/entities/claim.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';

@Entity('claims')
export class Claim {
  @PrimaryColumn({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'CouponID' })
  couponID: string;

  @Column({ type: 'int', name: 'Remaining', nullable: false })
  remaining: number;

  @CreateDateColumn({ name: 'ClaimedAt' })
  claimedAt: Date;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'memberID' })
  user: Member;

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CouponID', referencedColumnName: 'couponID' })
  coupon: Coupon;
}

