// src/member/entities/member.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberType } from '../member-type.enum';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  member_id: string;

  @Column({ type: 'varchar', length: 40, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  account: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 12, unique: true, nullable: false })
  phoneNumber: string;

  @Column({ type: 'enum', enum: MemberType, default: MemberType.User })
  type: MemberType;

  @Column({ type: 'varchar', length: 20, nullable: false })
  username: string;

  @Column({ type: 'int', default: 0 })
  level: number;

  @Column({ type: 'int', default: 0 })
  userState: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  merchantsName: string | null;

  @Column({ type: 'int', nullable: true, default: null })
  merchantsState: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address: string | null;

  @Column({ type: 'int', default: 0 })
  subscriberCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
