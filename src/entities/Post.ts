import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { UpVotes } from "./UpVotes";
import { PostComments } from "./Comments";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field()
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @OneToMany(() => UpVotes, (upVotes) => upVotes.post)
  upVotes: UpVotes[];

  @Field(() => [PostComments])
  @OneToMany(() => PostComments, (comment) => comment.post, {
    cascade: true,
    eager: true,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  comments: PostComments[];

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

  @Field()
  @Column({ type: "timestamptz" })
  createdAt: Date = new Date();

  @Field()
  @Column({ type: "timestamptz" })
  updatedAt: Date = new Date();

  @Field()
  @Column({ type: "text" })
  title!: string;

  @Field()
  @Column({ type: "text" })
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => [Int], { nullable: true })
  @Column("int", { array: true, nullable: true })
  savedBy: number[];

  @Field(() => [Int], { nullable: true })
  @Column("int", { array: true, nullable: true })
  hiddenBy: number[];
}
