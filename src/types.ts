import DataLoader from "dataloader";
import { Request, Response } from "express";
import Redis from "ioredis";
import { User } from "./entities/User";
import { UpVotes } from "./entities/UpVotes";
export type MyContext = {
  //  em: EntityManager<IDatabaseDriver<Connection>>,
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: DataLoader<number, User, number>;
  upVotesLoader: DataLoader<
    {
      userId: number;
      postId: number;
    },
    UpVotes,
    {
      userId: number;
      postId: number;
    }
  >;
};
