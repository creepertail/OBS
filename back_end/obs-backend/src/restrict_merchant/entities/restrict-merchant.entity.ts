// src/restrict_merchant/entities/restrict-merchant.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';

@Entity('restrict_merchant')
export class RestrictMerchant {
  @PrimaryColumn({ type: 'char', length: 36 })
  adminID: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  merchantID: string;

  @Column({ type: 'int', nullable: false })
  originalState: number;

  @Column({ type: 'int', nullable: false })
  latestState: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminID', referencedColumnName: 'memberID' })
  admin: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantID', referencedColumnName: 'memberID' })
  merchant: Member;
}
