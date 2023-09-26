"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpvoteResolver = void 0;
const dataSource_1 = require("../dataSource");
const UpVotes_1 = require("../entities/UpVotes");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
let UpvoteResolver = exports.UpvoteResolver = class UpvoteResolver {
    hello() {
        return "hey Paurush";
    }
    async vote(postId, value, ctx) {
        const userId = ctx.req.session.user;
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const upVote = await UpVotes_1.UpVotes.findOne({
            where: {
                postId: postId,
                userId: userId,
            },
        });
        const user = await User_1.User.findOne({
            where: {
                _id: userId,
            },
        });
        if (upVote && upVote.value !== realValue) {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`update up_votes set value = $1 where "postId" = $2 and "userId" = $3`, [realValue, postId, userId]);
                await tm.query(` update post 
        set points = points + ${2 * realValue}
        where _id = ${postId};`);
            });
            if (user) {
                const newUpVote = await UpVotes_1.UpVotes.findOne({
                    where: {
                        userId: userId,
                        postId: postId,
                    },
                });
                if (newUpVote) {
                    const index = await user.upVotes.findIndex((upvote) => upvote.postId === postId && upvote.userId === userId);
                    user.upVotes[index] = newUpVote;
                    await User_1.User.save(user);
                }
            }
        }
        else if (!upVote) {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`insert into up_votes ("userId", "postId", "value") values (${userId}, ${postId}, ${realValue});`);
                await tm.query(` update post 
        set points = points + ${realValue}
        where _id = ${postId};`);
            });
            if (user) {
                const newUpVote = await UpVotes_1.UpVotes.findOne({
                    where: {
                        userId: userId,
                        postId: postId,
                    },
                });
                if (newUpVote) {
                    if (!user.upVotes)
                        user.upVotes = [];
                    user.upVotes.push(newUpVote);
                    await User_1.User.save(user);
                }
            }
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UpvoteResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UpvoteResolver.prototype, "vote", null);
exports.UpvoteResolver = UpvoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UpvoteResolver);
//# sourceMappingURL=upvote.js.map