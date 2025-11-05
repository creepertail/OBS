// src/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', unique: true, length: 40, nullable: false })
  email: string;

  @Column({ type: 'varchar', unique: true, length: 20, nullable: false })
  account: string;

  // 密碼經過bcrypt加密後，會變成60多個字元
  @Column({ type: 'varchar', length: 255, nullable: false }) 
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 12, unique: true, nullable: false })
  phone: string;

  @Column({ type: 'int', default: 0, nullable: false })
  level: number; 
  /*
    0 普通會員 
    1 白金會員 
    2 黑金會員 
    3 鑽石會員
  */

  @Column({ type: 'int', default: 0, nullable: false })
  state: number;

  /*(右到左)(0表示可以)
    第 0 bit：下訂權限 
    第 1 bit：留言權限
  */

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}