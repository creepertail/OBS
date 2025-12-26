// src/order/entities/contains.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Order } from './order.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('contain')
export class Contains {
  @PrimaryColumn({ type: 'char', length: 36 })
  orderId: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  bookId: string;

  @Column({ type: 'int', nullable: false })
  amount: number;

  @ManyToOne(() => Order, (order) => order.contains, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId', referencedColumnName: 'orderId' })
  order: Order;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'bookID' })
  book: Book;
}
