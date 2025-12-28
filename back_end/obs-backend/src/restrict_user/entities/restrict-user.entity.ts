// src/restrict_user/entities/restrict-user.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';

@Entity('restrict_user')
export class RestrictUser {
  @PrimaryColumn({ type: 'char', length: 36 })
  adminID: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  userID: string;

  @Column({ type: 'int', nullable: false })
  originalState: number;

  @Column({ type: 'int', nullable: false })
  latestState: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'adminID', referencedColumnName: 'memberID' })
  admin: Member;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userID', referencedColumnName: 'memberID' })
  user: Member;
}
