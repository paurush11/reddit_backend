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
import { Migrations1691700865366 } from "./migrations/1691700865365-migrations";

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
  migrations: [Migrations1691700865366],
});
