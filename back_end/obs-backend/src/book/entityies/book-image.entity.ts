// src/book/entityies/book-image.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';

@Entity('book_images')
export class BookImage {
  @PrimaryGeneratedColumn('uuid')
  imageID: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  imageUrl: string;

  @Column({ type: 'int', default: 0, nullable: false })
  displayOrder: number; // 顯示排序

  @Column({ type: 'boolean', default: false })
  isCover: boolean; // 是否為封面

  // 這邊可利用存在bookID的這個FK
  // 去使用整個book
  // 不過DB內紀錄的東西還是bookID
  // 使用上可以直接使用Book
  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookID', referencedColumnName: 'bookID' })
  book: Book;

  @Column({ type: 'uuid' })
  bookID: string;
}
