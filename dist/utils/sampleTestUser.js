"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../entities/User");
const testUser = new User_1.User();
testUser._id = -1;
testUser.email = "";
testUser.password = "";
testUser.posts = [];
testUser.upVotes = [];
testUser.username = "Deleted User";
testUser.updatedAt = new Date();
testUser.createdAt = new Date();
exports.default = testUser;
//# sourceMappingURL=sampleTestUser.js.map