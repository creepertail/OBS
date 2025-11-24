// src/subscription/entities/subscribes.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';

@Entity('subscribes')
export class Subscribes {
  @PrimaryColumn({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'MerchantID' })
  merchantID: string;

  // 是否開啟通知
  @Column({ type: 'boolean', default: false, nullable: false, name: 'NotificationEnabled' })
  notificationEnabled: boolean;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'memberID' })
  user: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MerchantID', referencedColumnName: 'memberID' })
  merchant: Member;
}
