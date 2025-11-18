// src/coupon/entities/manage.entity.ts
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Coupon } from './coupon.entity';

@Entity('manage')
export class Manage {
  @PrimaryColumn({ type: 'char', length: 36 })
  adminID: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  couponID: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ referencedColumnName: 'member_id' })
  admin: Member;

  @ManyToOne(() => Coupon, (coupon) => coupon.managedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ referencedColumnName: 'couponID' })
  coupon: Coupon;
}
