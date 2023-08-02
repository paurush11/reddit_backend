import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field()
  @Column({ type: "timestamptz" })
  createdAt: Date = new Date();

  @Field()
  @Column({ type: "timestamptz" })
  updatedAt: Date = new Date();

  @Field()
  @Column({ type: "text" })
  title!: string;
}
