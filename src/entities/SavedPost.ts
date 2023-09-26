import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class SavedPost extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.savedPosts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  user: User;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.savedPosts, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  post: Post;
}
