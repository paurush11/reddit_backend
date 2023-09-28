"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
const constants_1 = require("./constants");
const _1691700865365_migrations_1 = require("./migrations/1691700865365-migrations");
const UpVotes_1 = require("./entities/UpVotes");
const Comments_1 = require("./entities/Comments");
require("dotenv").config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: constants_1.DB_PORT,
    username: process.env.DATASRC_USERNAME,
    password: process.env.DATASRC_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: true,
    entities: [Post_1.Post, User_1.User, UpVotes_1.UpVotes, Comments_1.PostComments],
    migrations: [_1691700865365_migrations_1.Migrations1691700865366],
});
//# sourceMappingURL=dataSource.js.map