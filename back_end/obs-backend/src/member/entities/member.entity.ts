// src/member/entities/member.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MemberType } from '../member-type.enum';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  member_id: string;

  @Column({ type: 'varchar', length: 40, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  account: string;

  // 密碼需儲存雜湊後字串，預留較長長度
  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 12, unique: true, nullable: false })
  phoneNumber: string;

  @Column({ type: 'enum', enum: MemberType, default: MemberType.User, nullable: false })
  type: MemberType;

  @Column({ type: 'varchar', length: 20, nullable: true })
  userName?: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  userLevel?: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  userState?: number;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  merchantName?: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  merchantState?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  merchantAddress?: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  merchantSubscriberCount?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
