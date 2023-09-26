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
exports.CommentResolver = void 0;
const User_1 = require("../entities/User");
const Comments_1 = require("../entities/Comments");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const createPostLoader_1 = require("../utils/createPostLoader");
let CommentResolver = exports.CommentResolver = class CommentResolver {
    creator(comments, ctx) {
        console.log(comments);
        return ctx.userLoader.load(comments.creatorId);
    }
    async post(comments, ctx) {
        const postLoader = (0, createPostLoader_1.createPostLoader)();
        let post = await postLoader.load(comments.postId);
        return post;
    }
    async getComments(ctx) {
        return await Comments_1.PostComments.find({
            where: { creatorId: ctx.req.session.user },
        });
    }
    async addComments(ctx, PostId, Description) {
        const comment = await Comments_1.PostComments.create({
            creatorId: ctx.req.session.user,
            description: Description,
            postId: PostId,
        }).save();
        console.log(comment);
        return comment;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Comments_1.PostComments, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Post_1.Post),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Comments_1.PostComments, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Comments_1.PostComments]),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getComments", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Comments_1.PostComments, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("PostId", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)("Description", () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "addComments", null);
exports.CommentResolver = CommentResolver = __decorate([
    (0, type_graphql_1.Resolver)(Comments_1.PostComments)
], CommentResolver);
//# sourceMappingURL=comment.js.map