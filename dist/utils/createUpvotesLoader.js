"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpVotesLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const UpVotes_1 = require("../entities/UpVotes");
const createUpVotesLoader = () => new dataloader_1.default(async (keys) => {
    const upVotes = await UpVotes_1.UpVotes.findByIds(keys);
    const userIdToUse = {};
    upVotes.forEach((up_votes) => {
        userIdToUse[`${up_votes.userId}|${up_votes.postId}`] = up_votes;
    });
    return keys.map((up_votes) => userIdToUse[`${up_votes.userId}|${up_votes.postId}`]);
});
exports.createUpVotesLoader = createUpVotesLoader;
//# sourceMappingURL=createUpvotesLoader.js.map