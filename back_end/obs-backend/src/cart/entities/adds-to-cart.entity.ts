// src/cart/entities/adds-to-cart.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('add_to_cart')
export class AddsToCart {
  @PrimaryColumn({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'BookID' })
  bookID: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'memberID' })
  user: Member;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'BookID', referencedColumnName: 'bookID' })
  book: Book;
}
