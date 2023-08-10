import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("identifier", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({
      where: {
        _id: id,
      },
    });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() ctx: MyContext,
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: ctx.req.session.user,
    }).save();
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePost(@Arg("Identifier") id: number): Promise<Boolean> {
    try {
      await Post.delete({
        _id: id,
      });
    } catch (error) {
      return false;
    }

    return true;
  }
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("Title", () => String, { nullable: true }) title: string,
    @Arg("Identifier") id: number,
  ): Promise<Post | null> {
    const post = await Post.findOne({
      where: {
        _id: id,
      },
    });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({ _id: id }, { title });
    }
    return post;
  }
}
