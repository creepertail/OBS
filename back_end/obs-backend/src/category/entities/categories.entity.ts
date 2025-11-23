// src/category/entities/categories.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BelongsTo } from '../../belongs-to/entities/belongs-to.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ name: 'ID' })
  categoryID: number;

  @Column({ type: 'varchar', length: 20, name: 'Name', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, name: 'Description', nullable: true })
  description?: string;

  @OneToMany(() => BelongsTo, (connection) => connection.category)
  belongsToConnections: BelongsTo[];
}
