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
const SavedPost_1 = require("./entities/SavedPost");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: constants_1.DB_HOST,
    port: constants_1.DB_PORT,
    username: constants_1.DATASRC_USERNAME,
    password: constants_1.DATASRC_PASSWORD,
    database: constants_1.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [Post_1.Post, User_1.User, UpVotes_1.UpVotes, Comments_1.PostComments, SavedPost_1.SavedPost],
    migrations: [_1691700865365_migrations_1.Migrations1691700865366],
});
//# sourceMappingURL=dataSource.js.map