// src/manage/entities/manage.entity.ts
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Coupon } from '../../coupon/entities/coupon.entity';

@Entity('manage')
export class Manage {
  @PrimaryColumn({ type: 'char', length: 36, name: 'AdminID' })
  adminID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'CouponID' })
  couponID: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'AdminID', referencedColumnName: 'memberID' })
  admin: Member;

  @ManyToOne(() => Coupon, (coupon) => coupon.managedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'CouponID', referencedColumnName: 'couponID' })
  coupon: Coupon;
}
