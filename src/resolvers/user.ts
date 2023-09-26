import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { UserNameOrEmailPassword } from "../utils/UserNameOrEmailPassword";
import { validate } from "../utils/validate";
import { sendEmail } from "../utils/sendEmail";
import * as crypto from "crypto";
import { Post } from "../entities/Post";
import { createPostLoader } from "../utils/createPostLoader";

@ObjectType()
class FieldError {
  @Field()
  field!: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  /// Field Level Resolver to see that if I am logged In I can see the email
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() ctx: MyContext) {
    if (ctx.req.session.user === user._id) {
      return user.email;
    } else {
      return "";
    }
  }

  @Query(() => User, { nullable: true })
  async Me(@Ctx() ctx: MyContext) {
    ///user not logged in
    if (!ctx.req.session.user) {
      return null;
    }
    const user = await User.findOne({
      where: {
        _id: ctx.req.session.user,
      },
    });
    return user;
  }
  @Query(() => [Post], { nullable: true })
  async MyVotedPosts(@Ctx() ctx: MyContext) {
    ///user not logged in
    if (!ctx.req.session.user) {
      return null;
    }
    const user = await User.findOne({
      where: {
        _id: ctx.req.session.user,
      },
    });

    if (!user || !user.upVotes) {
      return null;
    }

    const postIds = user.upVotes.map((upvote) => upvote.postId);
    console.log(postIds);
    const postLoader = createPostLoader();
    let postPromise = await postIds.map((id) => {
      return postLoader.load(id);
    });

    let posts = await Promise.all(postPromise);
    return posts;
  }

  @Mutation(() => UserResponse, { nullable: false })
  async register(
    @Ctx() ctx: MyContext,
    @Arg("options") options: UserNameOrEmailPassword,
  ): Promise<UserResponse> {
    const hashedPassword = await argon2.hash(options.password);
    const errors = validate(options);
    if (errors) {
      return { errors };
    }
    const user = await User.create({
      email: options.email,
      username: options.username,
      password: hashedPassword,
    });

    try {
      await user.save();
    } catch (err) {
      console.log(err);
      if (err.code === "23505" || err.details.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "Duplicate User Exits",
            },
          ],
        };
      }
    }
    ctx.req.session.user = user._id; //Auto log you in
    return { user };
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("token") token: string,
    @Ctx() ctx: MyContext,
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password is too short!",
          },
        ],
      };
    }
    console.log(newPassword);
    console.log(token);
    const key = process.env.FORGOT_PASSWORD + token;
    const userId = (await ctx.redis.get(key)) as string;
    const user = await User.findOne({
      where: {
        _id: parseInt(userId),
      },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "No such user Exist!",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(newPassword);
    await User.update({ _id: parseInt(userId) }, { password: hashedPassword });

    await ctx.redis.del(key);
    ctx.req.session.user = parseInt(userId);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Ctx() ctx: MyContext,
    @Arg("UserNameOrEmail") UserNameOrEmail: string,
  ) {
    const user = await User.findOne({
      where: UserNameOrEmail.includes("@")
        ? {
            email: UserNameOrEmail,
          }
        : {
            username: UserNameOrEmail,
          },
    });

    if (!user) {
      console.log("wrong");
      return true;
    }
    console.log(UserNameOrEmail);
    console.log(user.password);
    const token = crypto.randomUUID();
    await ctx.redis.set(
      process.env.FORGOT_PASSWORD + token,
      user._id,
      "EX",
      1000 * 60 * 60 * 24 * 3,
    ); // for 3 days

    console.log(`http://localhost:3000/change-password/${token}`);
    await sendEmail(
      user.email,
      `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`,
    );
    return true;
  }

  @Mutation(() => UserResponse, { nullable: false })
  async login(
    @Ctx() ctx: MyContext,
    @Arg("UserNameOrEmail") UserNameOrEmail: string,
    @Arg("password") password: string,
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: UserNameOrEmail.includes("@")
        ? {
            email: UserNameOrEmail,
          }
        : {
            username: UserNameOrEmail,
          },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "User Not Found",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password",
          },
        ],
      };
    }
    ctx.req.session.user = user._id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() ctx: MyContext) {
    return new Promise((resolve) =>
      ctx.req.session.destroy((err) => {
        ctx.res.clearCookie(process.env.COOKIE_NAME as string);
        if (err) {
          console.log(err);
          resolve(err);
          return false;
        }

        resolve(true);
        return true;
      }),
    );
  }

  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find({});
  }

  @Mutation(() => Boolean, { nullable: true })
  async delete(@Arg("username") username: string): Promise<Boolean> {
    try {
      await User.delete({
        username: username,
      });
    } catch (error) {
      return false;
    }

    return true;
  }
}
