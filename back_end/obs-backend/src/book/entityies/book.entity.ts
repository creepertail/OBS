// src/book/entities/book.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BookImage } from './book-image.entity';

@Entity('book')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    bookID: string;

    @Column({ type: 'char', length: 13, nullable: false })
    ISBN: string;

    @Column({ type: 'varchar', length: 100, nullable: false})
    Name: string;

    @OneToMany(() => BookImage, image => image.book, { cascade: true })
    images: BookImage[];


    // 書本上架狀態：0表示售完，1表示上架中
    @Column({ type: 'int', default: 0, nullable: false})
    Status: number;
    
    @Column({ type: 'varchar', length: 500, nullable: false})
    ProductDescription: string;

    // todo
    // InventoryQuantity、Price 要 > 0
    @Column({ type: 'int', default: 0, nullable: false})
    InventoryQuantity: number;

    @Column({ type: 'int', default: 0, nullable: false})
    Price: number;

    @Column({ type: 'varchar', length: 200, nullable: false})
    Author: string;

    @Column({ type: 'varchar', length: 50, nullable: false})
    Publisher: string;

    // todo => foreign key to Merchant
    @Column({ type: 'uuid', nullable: false})
    MerchantID: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}