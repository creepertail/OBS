import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
// import { Book } from '../../book/entityies/book.entity';

@Entity('favorite')
export class Favorite {
  @PrimaryColumn({ type: 'char', length: 36, name: 'UserID' })
  userID: string;

  @PrimaryColumn({ type: 'char', length: 36, name: 'BookID' })
  bookID: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'memberID' })
  user: Member;

  // @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'BookID', referencedColumnName: 'bookID' })
  // book: Book;
}
