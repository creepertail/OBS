// src/book/entityies/belongs-to.entity.ts
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Book } from './book.entity';
import { Category } from '../../category/entities/categories.entity';

@Entity('Belong_To')
export class BelongsTo {
  @PrimaryColumn({ type: 'char', length: 36 })
  bookId: string;

  @PrimaryColumn({ type: 'char', length: 36 })
  categoryId: string;

  @ManyToOne(() => Book, (book) => book.belongsToConnections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'bookId' })
  book: Book;

  @ManyToOne(() => Category, (category) => category.belongsToConnections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'categoryId' })
  category: Category;
}
