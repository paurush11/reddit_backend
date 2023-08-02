import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import {
  DATASRC_PASSWORD,
  DATASRC_USERNAME,
  DB_HOST,
  DB_NAME,
  DB_PORT,
} from "./constants";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DATASRC_USERNAME,
  password: DATASRC_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: true,
  entities: [Post, User],
});
