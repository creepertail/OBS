// src/book/entities/book.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { BelongsTo } from './belongs-to.entity';
// import { Favorite } from '../../favorite/entities/favorite.entity';
// import { AddsToCart } from '../../cart/entities/adds-to-cart.entity';
// import { Review } from '../../review/entities/review.entity';
// import { Contains } from '../../order/entities/contains.entity';
import { Member } from '../../member/entities/member.entity';

@Entity('Book')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  bookID: string;

  @Column({ type: 'char', length: 13, nullable: false })
  ISBN: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @OneToMany(() => BelongsTo, (connection) => connection.book, { cascade: true })
  belongsToConnections: BelongsTo[];

  // TODO: Uncomment when Category entity is available
  // @OneToMany(() => Favorite, (favorite) => favorite.book)
  // favorites: Favorite[];

  // @OneToMany(() => AddsToCart, (item) => item.book)
  // addsToCart: AddsToCart[];

  // @OneToMany(() => Review, (review) => review.book)
  // reviews: Review[];

  // @OneToMany(() => Contains, (item) => item.book)
  // contains: Contains[];

  @Column({ type: 'int', default: 0, nullable: false })
  status: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  productDescription: string;

  @Column({ type: 'int', nullable: false })
  inventoryQuantity: number;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  author: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  publisher: string;

  @Column({ type: 'char', length: 36, nullable: false })
  merchantId: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId', referencedColumnName: 'member_id' })
  merchant: Member;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
