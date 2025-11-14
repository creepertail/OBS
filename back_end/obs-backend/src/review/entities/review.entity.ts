import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
// import { Book } from '../../book/entityies/book.entity';

@Entity('Review')
export class Review {
  @PrimaryColumn({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'BookID' })
  bookID: string;

  @Column({ type: 'date', nullable: false, name: 'Date' })
  date: Date;

  @Column({ type: 'int', nullable: false, name: 'Stars' })
  stars: number;

  @Column({ type: 'varchar', length: 200, nullable: false, name: 'Description' })
  description: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'member_id' })
  user: Member;

  // @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'BookID', referencedColumnName: 'bookID' })
  // book: Book;
}
