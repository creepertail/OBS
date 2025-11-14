// src/subscription/entities/subscribes.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';

@Entity('Subscribes')
export class Subscribes {
  @PrimaryColumn({ type: 'char', length: 36 })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  merchantID: string;

  @Column({ type: 'int', default: 0, nullable: false })
  state: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'member_id' })
  user: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'MerchantID', referencedColumnName: 'member_id' })
  merchant: Member;
}
