// src/cart/entities/adds-to-cart.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
// import { Book } from '../../book/entityies/book.entity';

@Entity('Add_To_Cart')
export class AddsToCart {
  @PrimaryColumn({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'BookID' })
  bookID: string;

  @Column({ type: 'int', name: 'Amount', nullable: false })
  amount: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'member_id' })
  user: Member;

  // @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'BookID', referencedColumnName: 'bookID' })
  // book: Book;
}
