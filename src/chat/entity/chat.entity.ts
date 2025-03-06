import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userMessage: string;

  @Column({ nullable: true })
  botResponse: string;

  @CreateDateColumn()
  createdAt: Date;
}
