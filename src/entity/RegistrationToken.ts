import { Entity, BaseEntity, PrimaryColumn, CreateDateColumn, Column } from "typeorm";

@Entity()
export class RegistrationToken extends BaseEntity{

    @PrimaryColumn()
    token: string;

    @Column({ default: 0 })
    usedBy: number;

    @CreateDateColumn()
    createdAt: Date;

};
