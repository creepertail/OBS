// src/book/entityies/belongs-to.entity.ts
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Book } from '../../book/entityies/book.entity';
import { Category } from '../../category/entities/categories.entity';

@Entity('belong_to')
export class BelongsTo {
  @PrimaryColumn({ type: 'char', length: 36 })
  bookID: string;

  @PrimaryColumn({ type: 'int' })
  categoryId: number;

  @ManyToOne(() => Book, (book) => book.belongsToConnections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookID', referencedColumnName: 'bookID' })
  book: Book;

  @ManyToOne(() => Category, (category) => category.belongsToConnections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'categoryID' })
  category: Category;
}
