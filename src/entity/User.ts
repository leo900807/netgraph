import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    userName: string;

    @Column()
    encryptedPwd: string;

    @Column()
    nickName: string;

    @Column({ nullable: true })
    email: string | null;

    @Column({ nullable: true })
    changeToken: string | null;

    @Column({ nullable: true })
    changeTokenCreatedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

};
