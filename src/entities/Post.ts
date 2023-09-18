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
}
