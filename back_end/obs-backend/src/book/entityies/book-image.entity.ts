// src/book/entities/book-image.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Book } from './book.entity';

@Entity('book_images')
export class BookImage {
    @PrimaryGeneratedColumn('uuid')
    imageID: string;

    @Column({ type: 'varchar', length: 500, nullable: false })
    imageUrl: string;

    @Column({ type: 'int', default: 0, nullable: false })
    displayOrder: number; // 圖片順序

    @Column({ type: 'boolean', default: false })
    isCover: boolean; // 是否為封面


    // 這邊可利用存在bookID的這個FK
    // 去使用整個book
    // 不過DB內紀錄的東西還是bookID
    // 使用上可以直接使用Book
    @ManyToOne(() => Book, book => book.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookID' })
    book: Book;

    @Column({ type: 'uuid' })
    bookID: string;
}