"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../entities/User");
const sampleTestPost_1 = __importDefault(require("./sampleTestPost"));
const testUser = new User_1.User();
testUser._id = -1;
testUser.email = "";
testUser.password = "";
testUser.posts = [sampleTestPost_1.default];
testUser.upVotes = [];
testUser.username = "Deleted User";
testUser.updatedAt = new Date();
testUser.createdAt = new Date();
exports.default = testUser;
//# sourceMappingURL=sampleTestUser.js.map