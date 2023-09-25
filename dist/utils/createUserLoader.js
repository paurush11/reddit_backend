"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const User_1 = require("../entities/User");
const sampleTestUser_1 = __importDefault(require("./sampleTestUser"));
const createUserLoader = () => new dataloader_1.default(async (userIds) => {
    const users = await User_1.User.findByIds(userIds);
    const userIdToUse = {};
    users.forEach((u) => {
        userIdToUse[u._id] = u;
    });
    userIds.map((userId) => {
        const user = userIdToUse[userId];
        if (!user) {
            userIdToUse[userId] = sampleTestUser_1.default;
        }
    });
    return userIds.map((userId) => userIdToUse[userId]);
});
exports.createUserLoader = createUserLoader;
//# sourceMappingURL=createUserLoader.js.map