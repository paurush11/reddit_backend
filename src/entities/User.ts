import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";
import { UpVotes } from "./UpVotes";

@ObjectType()
@Entity()
export class User extends BaseEntity {
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
  @Column({ unique: true })
  username!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

  @OneToMany(() => UpVotes, (upVotes) => upVotes.user)
  upVotes: UpVotes[];

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;
}
