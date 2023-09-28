import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { __prod__ } from "./constants";
import { AppDataSource } from "./dataSource";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpVotesLoader } from "./utils/createUpvotesLoader";
import { CommentResolver } from "./resolvers/comment";
import { UpvoteResolver } from "./resolvers/upvote";


const main = async () => {
  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });

  const app = express();
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    }),
  );

  app.set("trust proxy", !__prod__); // used to see localhost cookies
  // app.set('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
  app.set("Access-Control-Allow-Credentials", true);
  // app.set('Access-Control-Allow-Origin', 'http://localhost:3000')

  const redis = new Redis();
  const RedisStore = require("connect-redis").default;
  const redisStore = new RedisStore({
    client: redis,
    disableTouch: true,
  });
  app.use(
    session({
      name: process.env.COOKIE_NAME,
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: "keyboard cat",

      cookie: {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, /// 10 years
        httpOnly: true,
        secure: true, /// cookie only works in HTTPS
        sameSite: "none",
      },
    }),
  );

  const apolloServer = new ApolloServer({
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upVotesLoader: createUpVotesLoader(),
    }),

    schema: await buildSchema({
      validate: false,
      resolvers: [
        HelloResolver,
        PostResolver,
        UserResolver,
        CommentResolver,
        UpvoteResolver,

      ],
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });
  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((e) => {
  console.error(e);
});
console.log("Hello World 2");
