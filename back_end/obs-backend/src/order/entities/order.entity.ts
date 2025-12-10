// src/order/entities/order.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
// import { Coupon } from '../../coupon/entities/coupon.entity';
import { Contains } from './contains.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  orderId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  shippingAddress: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  paymentMethod: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  totalPrice: number;

  @Column({ type: 'int',  nullable: false, default: 0 })
  state: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  totalAmount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ type: 'char', length: 36, nullable: false })
  userId: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'memberID' })
  user: Member;

  @Column({ type: 'char', length: 36, nullable: false })
  merchantId: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId', referencedColumnName: 'memberID' })
  merchant: Member;

  @Column({ type: 'char', length: 36, nullable: true })
  couponId?: string;

  // TODO: Uncomment when Coupon entity is available

  // @ManyToOne(() => Coupon, (coupon) => coupon.orders, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'couponId', referencedColumnName: 'couponId' })
  // coupon?: Coupon;

  @OneToMany(() => Contains, (item) => item.order, { cascade: true })
  contains: Contains[];
}
