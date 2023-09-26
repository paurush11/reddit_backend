import { User } from "../entities/User";
import { PostComments } from "../entities/Comments";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { createPostLoader } from "../utils/createPostLoader";
import { isAuth } from "../middleware/isAuth";

@Resolver(PostComments)
export class CommentResolver {
  @FieldResolver(() => User)
  creator(
    @Root() comments: PostComments,
    @Ctx() ctx: MyContext,
  ): Promise<User | null> {
    console.log(comments);
    return ctx.userLoader.load(comments.creatorId);
  }
  @FieldResolver(() => Post)
  async post(
    @Root() comments: PostComments,

  ): Promise<Post | null> {
    const postLoader = createPostLoader();
    let post = await postLoader.load(comments.postId);
    return post;
  }

  @Query(() => [PostComments])
  async getComments(@Ctx() ctx: MyContext) {
    return await PostComments.find({
      where: { creatorId: ctx.req.session.user },
    });
  }

  @Mutation(() => PostComments, { nullable: true })
  async addComments(
    @Ctx() ctx: MyContext,
    @Arg("PostId", () => Int) PostId: number,
    @Arg("Description", () => String) Description: string,
  ) {
    const comment = await PostComments.create({
      creatorId: ctx.req.session.user,
      description: Description,
      postId: PostId,
    }).save();
    console.log(comment);
    return comment;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Ctx() ctx: MyContext,
    @Arg("PostId", () => Int) PostId: number,
    @Arg("CommentId", () => Int) CommentId: number,
  ) {
    const comment = await PostComments.findOne({
      where: {
        creatorId: ctx.req.session.user,
        postId: PostId,
        _id: CommentId,
      },
    });

    if (comment?.hasReplies) {
      console.log("Comment has replies!! Cant delete");
      return false;
    }

    const res = await PostComments.delete({
      _id: comment?._id,
    });

    return res.affected === 1;
  }
}
