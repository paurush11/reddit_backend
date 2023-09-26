import { MyContext } from "../types";
import { SavedPost } from "../entities/SavedPost";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";

import testSavedPost from "../utils/sampleSavedPost";

@Resolver()
export class SavedPostResolver {
  @Query(() => SavedPost)
  @UseMiddleware(isAuth)
  async getSavedPosts(
    @Ctx() ctx: MyContext,
    @Arg("postId", () => Int) postId: number,
  ) {
    const post = await SavedPost.findOne({
      where: {
        userId: ctx.req.session.user,
        postId: postId,
      },
    });
    if (!post) return testSavedPost;
    console.log(post);
    return post;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async savePost(
    @Ctx() ctx: MyContext,
    @Arg("postId", () => Int) postId: number,
  ) {
    const isPostSaved = await SavedPost.findOne({
      where: {
        userId: ctx.req.session.user,
        postId: postId,
      },
    });
    if (isPostSaved) return false;

    try {
      SavedPost.create({
        userId: ctx.req.session.user,
        postId: postId,
      }).save();
    } catch (e) {
      return false;
    }

    return true;
  }
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteSavedPost(
    @Ctx() ctx: MyContext,
    @Arg("postId", () => Int) postId: number,
  ) {
    const isPostSaved = await SavedPost.findOne({
      where: {
        userId: ctx.req.session.user,
        postId: postId,
      },
    });
    if (!isPostSaved) return false;

    const res = await SavedPost.delete({
      userId: ctx.req.session.user,
      postId: postId,
    });
    console.log(res);
    return true;
  }
}
