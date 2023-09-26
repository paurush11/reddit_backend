import { AppDataSource } from "../dataSource";
import { UpVotes } from "../entities/UpVotes";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
@Resolver()
export class UpvoteResolver {
  @Query(() => String)
  hello() {
    return "hey Paurush";
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

      if(user){
        const newUpVote = await UpVotes.findOne({
            where: {
              userId: userId,
              postId: postId,
            },
        })
        if(newUpVote){
           const index = await user.upVotes.findIndex((upvote)=>upvote.postId === postId && upvote.userId === userId)
           user.upVotes[index] = newUpVote;
           await User.save(user)
        }
      }
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
}
