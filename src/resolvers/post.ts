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
import { AppDataSource } from "../dataSource";

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
  async posts(
    @Arg('limit') limit: number,
    @Arg('cursor', ()=> String, {nullable: true}) cursor: string| null  
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit)
    const qb = await AppDataSource.getRepository(Post).createQueryBuilder("p").orderBy('"createdAt"').take(realLimit) 
    if(cursor){
      qb.where('"createdAt"< :cursor', {cursor: new Date(parseInt(cursor))})
    }
    return qb.getMany()
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
