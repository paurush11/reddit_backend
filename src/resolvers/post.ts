import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
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

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  Posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver()
export class PostResolver {
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit") limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replaceableValues: any = [realLimitPlusOne];
    if (cursor) {
      replaceableValues.push(new Date(Date.parse(cursor)));
    }
    const posts = await AppDataSource.getRepository(Post).query(
      `
    select p.*, 
    json_build_object(
      '_id', u._id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
    ) creator
    from post p
    inner join public.user u on u._id = p."creatorId"
    ${cursor ? `where p."createdAt"< $2` : ""}
    order by p."createdAt" DESC
    limit $1`,
      replaceableValues,
    );
    posts.forEach((post: { createdAt: string | number | Date; updatedAt: string | number | Date; creator: { createdAt: string | number | Date; updatedAt: string | number | Date; }; }) => {
      post.createdAt = new Date(post.createdAt);
      post.updatedAt = new Date(post.updatedAt);
  
      if (post.creator) {
          post.creator.createdAt = new Date(post.creator.createdAt);
          post.creator.updatedAt = new Date(post.creator.updatedAt);
      }
  });
    return {
      Posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
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
