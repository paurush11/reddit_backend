import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { DB_PORT } from "./constants";
import { Migrations1691700865366 } from "./migrations/1691700865365-migrations";
import { UpVotes } from "./entities/UpVotes";
import { PostComments } from "./entities/Comments";
import { SavedPost } from "./entities/SavedPost";
require('dotenv').config()

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: DB_PORT,
  username: process.env.DATASRC_USERNAME,
  password: process.env.DATASRC_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: true,
  entities: [Post, User, UpVotes, PostComments, SavedPost],
  migrations: [Migrations1691700865366],
});
