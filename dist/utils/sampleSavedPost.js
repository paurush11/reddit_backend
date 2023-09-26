"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SavedPost_1 = require("../entities/SavedPost");
const sampleTestUser_1 = __importDefault(require("./sampleTestUser"));
const sampleTestPost_1 = __importDefault(require("./sampleTestPost"));
const testSavedPost = new SavedPost_1.SavedPost();
testSavedPost._id = -1;
testSavedPost.post = sampleTestPost_1.default;
testSavedPost.user = sampleTestUser_1.default;
testSavedPost.userId = -1;
testSavedPost.postId = -1;
exports.default = testSavedPost;
//# sourceMappingURL=sampleSavedPost.js.map