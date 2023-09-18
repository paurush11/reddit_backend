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
import { UpVotes } from "../entities/UpVotes";

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
    @Ctx() ctx: MyContext,
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replaceableValues: any = [realLimitPlusOne];
    let cursorIdx = 3;
    if (ctx.req.session.user) {
      replaceableValues.push(ctx.req.session.user);
    }
    if (cursor) {
      replaceableValues.push(new Date(Date.parse(cursor)));
      cursorIdx = replaceableValues.length;
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
    ) creator,
    ${
      ctx.req.session.user
        ? '(select value from up_votes where "userId" = $2 and "postId" = p._id) "voteStatus"'
        : 'null as "voteStatus"'
    }
    from post p
    inner join public.user u on u._id = p."creatorId"
    ${cursor ? ` WHERE  p."createdAt" < $${cursorIdx}` : ""}
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
  async post(@Arg("identifier", () => Int) id: number,  @Ctx() ctx: MyContext,
  ): Promise<Post | null> {
    
// return Post.findOne({
//   where:{
//     _id: id
//   }, relations:["creator"]
// })
const postId = id; // this should be the ID of the post you want to fetch

const post = await AppDataSource.getRepository(Post).query(
  `
    select p.*, 
    json_build_object(
      '_id', u._id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
    ) creator,
    ${
      ctx.req.session.user
        ? '(select value from up_votes where "userId" = $2 and "postId" = p._id) "voteStatus"'
        : 'null as "voteStatus"'
    }
    from post p
    inner join public.user u on u._id = p."creatorId"
    where p._id = $1`,
  [postId, ctx.req.session.user? ctx.req.session.user : null],
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
