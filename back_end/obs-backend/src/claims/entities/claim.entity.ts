// src/claims/entities/claim.entity.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid', { name: 'ClaimID' })
  claimID: string;

  @Column({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @Column({ type: 'char', length: 36, name: 'CouponID' })
  couponID: string;

  @CreateDateColumn({ name: 'ClaimedAt' })
  claimedAt: Date;

  @Column({ type: 'int', name: 'State', nullable: false, default: 0 })
  state: number;

  @Column({ type: 'timestamp', name: 'UsedAt', nullable: true })
  usedAt?: Date | null;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'memberID' })
  user: Member;

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CouponID', referencedColumnName: 'couponID' })
  coupon: Coupon;
}
