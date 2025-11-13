// src/coupon/entities/coupon.entity.ts
import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Manage } from './manage.entity';
// import { Order } from '../../order/entities/order.entity';

@Entity('Coupon')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  couponID: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  validDate?: Date;

  @Column({ type: 'double', nullable: false})
  discount: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  description: string;

  @Column({ type: 'char', length: 36, nullable: false })
  memberID: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ referencedColumnName: 'member_id' })
  owner: Member;

  @OneToMany(() => Manage, (management) => management.coupon)
  managedBy: Manage[];

  // @OneToMany(() => Order, (order) => order.coupon)
  // orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
