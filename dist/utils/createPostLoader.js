"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Post_1 = require("../entities/Post");
const sampleTestPost_1 = __importDefault(require("./sampleTestPost"));
const createPostLoader = () => new dataloader_1.default(async (postIds) => {
    const users = await Post_1.Post.findByIds(postIds);
    const postIdToUse = {};
    users.forEach((u) => {
        postIdToUse[u._id] = u;
    });
    postIds.map((postId) => {
        const post = postIdToUse[postId];
        if (!post) {
            postIdToUse[postId] = sampleTestPost_1.default;
        }
    });
    return postIds.map((postId) => postIdToUse[postId]);
});
exports.createPostLoader = createPostLoader;
//# sourceMappingURL=createPostLoader.js.map