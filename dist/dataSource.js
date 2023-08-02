"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
const constants_1 = require("./constants");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: constants_1.DB_HOST,
    port: constants_1.DB_PORT,
    username: constants_1.DATASRC_USERNAME,
    password: constants_1.DATASRC_PASSWORD,
    database: constants_1.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [Post_1.Post, User_1.User],
});
//# sourceMappingURL=dataSource.js.map