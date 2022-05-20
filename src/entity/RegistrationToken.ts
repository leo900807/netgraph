import { Entity, PrimaryColumn, CreateDateColumn, Column } from "typeorm";

@Entity()
export class RegistrationToken{

    @PrimaryColumn()
    token: string;

    @Column({ nullable: true })
    usedBy: number;

    @CreateDateColumn()
    createdAt: Date;

};
