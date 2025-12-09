// src/order/entities/control.entity.ts
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Order } from './order.entity';

@Entity('control')
export class Control {
  @PrimaryColumn({ type: 'char', length: 36 })
  merchantId: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  orderId: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId', referencedColumnName: 'memberID' })
  merchant: Member;

  @ManyToOne(() => Order, (order) => order.controls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId', referencedColumnName: 'orderId' })
  order: Order;
}
