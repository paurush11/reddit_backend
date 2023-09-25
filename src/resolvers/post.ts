import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { AppDataSource } from "../dataSource";
import { Post } from "../entities/Post";
import { UpVotes } from "../entities/UpVotes";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { SaveOptions, RemoveOptions } from "typeorm";

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

@Resolver(() => Post)
export class PostResolver {
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() ctx: MyContext): Promise<User | null> {
    // return User.findOne({
    //   where: {
    //     _id: post.creatorId,
    //   },
    // });
    return ctx.userLoader.load(post.creatorId);
  }
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() ctx: MyContext,
  ): Promise<number | null> {
    // return User.findOne({
    //   where: {
    //     _id: post.creatorId,
    //   },
    // });
    const up_vote = await ctx.upVotesLoader.load({
      userId: ctx.req.session.user as number,
      postId: post._id,
    });

    return up_vote.value;
  }
  @Query(() => UpVotes)
  async myUpVotes(@Ctx() ctx: MyContext) {}

  @Query(() => PaginatedPosts)
  async myPosts(
    @Arg("limit") limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() ctx: MyContext,
  ) {
    const userId = ctx.req.session.user;
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replaceableValues: any = [realLimitPlusOne, userId];
    if (cursor) {
      replaceableValues.push(new Date(Date.parse(cursor)));
    }
    const posts = await AppDataSource.getRepository(Post).query(
      `
    select p.*
    from post p
    ${
      cursor
        ? ` WHERE  p."createdAt" < $3 and p."creatorId" = $2`
        : ` WHERE p."creatorId" = $2`
    }
    order by p."createdAt" DESC
    limit $1`,
      replaceableValues,
    );
    posts.forEach(
      (post: {
        createdAt: string | number | Date;
        updatedAt: string | number | Date;
        creator: {
          createdAt: string | number | Date;
          updatedAt: string | number | Date;
        };
      }) => {
        post.createdAt = new Date(post.createdAt);
        post.updatedAt = new Date(post.updatedAt);

        if (post.creator) {
          post.creator.createdAt = new Date(post.creator.createdAt);
          post.creator.updatedAt = new Date(post.creator.updatedAt);
        }
      },
    );
    return {
      Posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

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
    select p.*
    from post p
    ${cursor ? ` WHERE  p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1`,
      replaceableValues,
    );
    posts.forEach(
      (post: {
        createdAt: string | number | Date;
        updatedAt: string | number | Date;
        creator: {
          createdAt: string | number | Date;
          updatedAt: string | number | Date;
        };
      }) => {
        post.createdAt = new Date(post.createdAt);
        post.updatedAt = new Date(post.updatedAt);

        if (post.creator) {
          post.creator.createdAt = new Date(post.creator.createdAt);
          post.creator.updatedAt = new Date(post.creator.updatedAt);
        }
      },
    );

    return {
      Posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("identifier", () => Int) id: number): Promise<Post | null> {
    // return Post.findOne({
    //   where:{
    //     _id: id
    //   }, relations:["creator"]
    // })
    const postId = id; // this should be the ID of the post you want to fetch

    const post = await AppDataSource.getRepository(Post).query(
      `
    select p.* 
    from post p
    where p._id = $1`,
      [postId],
    );
    post.forEach(
      (post: {
        createdAt: string | number | Date;
        updatedAt: string | number | Date;
        creator: {
          createdAt: string | number | Date;
          updatedAt: string | number | Date;
        };
      }) => {
        post.createdAt = new Date(post.createdAt);
        post.updatedAt = new Date(post.updatedAt);

        if (post.creator) {
          post.creator.createdAt = new Date(post.creator.createdAt);
          post.creator.updatedAt = new Date(post.creator.updatedAt);
        }
      },
    );
    return post[0]; // Since query method will return an array, just select the first element.
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() ctx: MyContext,
  ) {
    const userId = ctx.req.session.user;
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    // UpVotes.insert({
    //   userId,
    //   postId,
    //   value,
    // });
    const upVote = await UpVotes.findOne({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    const user = await User.findOne({
      where: {
        _id: userId,
      },
    });

    if (upVote && upVote.value !== realValue) {
      /// user aldready voted and now changing
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `update up_votes set value = $1 where "postId" = $2 and "userId" = $3`,
          [realValue, postId, userId],
        );

        await tm.query(` update post 
        set points = points + ${2 * realValue}
        where _id = ${postId};`);
      });
    } else if (!upVote) {
      await AppDataSource.transaction(async (tm) => {
        /// user did not vote
        await tm.query(
          `insert into up_votes ("userId", "postId", "value") values (${userId}, ${postId}, ${realValue});`,
        );

        await tm.query(` update post 
        set points = points + ${realValue}
        where _id = ${postId};`);
      });

      if (user) {
        const newUpVote = await UpVotes.findOne({
          where: {
            userId: userId,
            postId: postId,
          },
        });
        if (newUpVote) {
          if (!user.upVotes) user.upVotes = [];

          user.upVotes.push(newUpVote);
          await User.save(user);
        }
      }
    }

    return true;
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
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() ctx: MyContext,
  ): Promise<Boolean> {
    try {
      const post = await Post.findOne({
        where: {
          _id: id,
        },
      });
      if (!post) {
        return false;
      }
      if (post.creatorId !== ctx.req.session.user)
        throw Error("Unauthorized User!!");

      await UpVotes.delete({
        postId: id,
      });
      await Post.delete({
        _id: id,
      });
    } catch (error) {
      return false;
    }
    // return await Post.delete({_id: id, creatorId: ctx.req.session.user})
    return true;
  }
  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("Title", () => String, { nullable: true }) title: string,
    @Arg("Text", () => String, { nullable: true }) text: string,
    @Ctx() ctx: MyContext,
  ): Promise<Post | null> {
    const result = AppDataSource.getRepository(Post)
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where(`_id = :id and "creatorId"= :creatorId`, {
        id,
        creatorId: ctx.req.session.user,
      })
      .returning("*")
      .execute();
    console.log(result);
    return (await result).raw[0];
  }
}
