"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Post_1 = require("../entities/Post");
const sampleTestUser_1 = __importDefault(require("./sampleTestUser"));
const testPost = new Post_1.Post();
testPost.title = "";
testPost.text = "";
testPost._id = -1;
testPost.creator = sampleTestUser_1.default;
testPost.creatorId = -1;
testPost.points = 0;
testPost.voteStatus = null;
testPost.updatedAt = new Date();
testPost.createdAt = new Date();
testPost.upVotes = [];
exports.default = testPost;
//# sourceMappingURL=sampleTestPost.js.map