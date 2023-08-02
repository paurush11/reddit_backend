"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const constants_1 = require("./constants");
const dataSource_1 = require("./dataSource");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const main = async () => {
    dataSource_1.AppDataSource.initialize()
        .then(() => {
        console.log("Data Source has been initialized!");
    })
        .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: ["http://localhost:3000", "https://studio.apollographql.com"],
        credentials: true,
    }));
    app.set("trust proxy", !constants_1.__prod__);
    app.set("Access-Control-Allow-Credentials", true);
    const redis = new ioredis_1.default();
    const RedisStore = require("connect-redis").default;
    const redisStore = new RedisStore({
        client: redis,
        disableTouch: true,
    });
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: redisStore,
        resave: false,
        saveUninitialized: false,
        secret: "keyboard cat",
        cookie: {
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        },
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        context: ({ req, res }) => ({
            req,
            res,
            redis,
        }),
        schema: await (0, type_graphql_1.buildSchema)({
            validate: false,
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
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
//# sourceMappingURL=index.js.map