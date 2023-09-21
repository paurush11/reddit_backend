import DataLoader from "dataloader";
import { Request, Response } from "express";
import Redis from "ioredis";
import { User } from "./entities/User";
export type MyContext = {
  //  em: EntityManager<IDatabaseDriver<Connection>>,
  req: Request;
  res: Response;
  redis: Redis;
  userLoader: DataLoader<number, User, number>;
};
