// src/category/entities/categories.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
// import { BelongsTo } from '../../book/entityies/belongs-to.entity';

@Entity('Category')
export class Category {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  categoryID: string;

  @Column({ type: 'varchar', length: 20, name: 'Name', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, name: 'Description', nullable: true })
  description?: string;

  // TODO: Uncomment when BelongsTo entity is available
  // @OneToMany(() => BelongsTo, (connection) => connection.category)
  // belongsToConnections: BelongsTo[];
}
