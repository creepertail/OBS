import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
// import { Book } from '../../book/entityies/book.entity';

@Entity('Review')
export class Review {
  @PrimaryColumn({ type: 'char', length: 36 })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  bookID: string;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'int', nullable: false })
  stars: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  description: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'member_id' })
  user: Member;

  // @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'BookID', referencedColumnName: 'bookID' })
  // book: Book;
}
