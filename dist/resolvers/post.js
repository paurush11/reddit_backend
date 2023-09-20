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
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const isAuth_1 = require("../middleware/isAuth");
const dataSource_1 = require("../dataSource");
const UpVotes_1 = require("../entities/UpVotes");
let PostInput = class PostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    (0, type_graphql_1.InputType)()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "Posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = exports.PostResolver = class PostResolver {
    async posts(limit, cursor, ctx) {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replaceableValues = [realLimitPlusOne];
        let cursorIdx = 3;
        if (ctx.req.session.user) {
            replaceableValues.push(ctx.req.session.user);
        }
        if (cursor) {
            replaceableValues.push(new Date(Date.parse(cursor)));
            cursorIdx = replaceableValues.length;
        }
        const posts = await dataSource_1.AppDataSource.getRepository(Post_1.Post).query(`
    select p.*, 
    json_build_object(
      '_id', u._id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
    ) creator,
    ${ctx.req.session.user
            ? '(select value from up_votes where "userId" = $2 and "postId" = p._id) "voteStatus"'
            : 'null as "voteStatus"'}
    from post p
    inner join public.user u on u._id = p."creatorId"
    ${cursor ? ` WHERE  p."createdAt" < $${cursorIdx}` : ""}
    order by p."createdAt" DESC
    limit $1`, replaceableValues);
        posts.forEach((post) => {
            post.createdAt = new Date(post.createdAt);
            post.updatedAt = new Date(post.updatedAt);
            if (post.creator) {
                post.creator.createdAt = new Date(post.creator.createdAt);
                post.creator.updatedAt = new Date(post.creator.updatedAt);
            }
        });
        return {
            Posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    async post(id, ctx) {
        const postId = id;
        const post = await dataSource_1.AppDataSource.getRepository(Post_1.Post).query(`
    select p.*, 
    json_build_object(
      '_id', u._id,
      'username', u.username,
      'email', u.email,
      'createdAt', u."createdAt",
      'updatedAt', u."updatedAt"
    ) creator,
    ${ctx.req.session.user
            ? '(select value from up_votes where "userId" = $2 and "postId" = p._id) "voteStatus"'
            : 'null as "voteStatus"'}
    from post p
    inner join public.user u on u._id = p."creatorId"
    where p._id = $1`, [postId, ctx.req.session.user ? ctx.req.session.user : null]);
        post.forEach((post) => {
            post.createdAt = new Date(post.createdAt);
            post.updatedAt = new Date(post.updatedAt);
            if (post.creator) {
                post.creator.createdAt = new Date(post.creator.createdAt);
                post.creator.updatedAt = new Date(post.creator.updatedAt);
            }
        });
        return post[0];
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
        if (upVote && upVote.value !== realValue) {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`update up_votes set value = $1 where "postId" = $2 and "userId" = $3`, [realValue, postId, userId]);
                await tm.query(` update post 
        set points = points + ${2 * realValue}
        where _id = ${postId};`);
            });
        }
        else if (!upVote) {
            await dataSource_1.AppDataSource.transaction(async (tm) => {
                await tm.query(`insert into up_votes ("userId", "postId", "value") values (${userId}, ${postId}, ${realValue});`);
                await tm.query(` update post 
        set points = points + ${realValue}
        where _id = ${postId};`);
            });
        }
        return true;
    }
    async createPost(input, ctx) {
        return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: ctx.req.session.user })).save();
    }
    async deletePost(id, ctx) {
        try {
            const post = await Post_1.Post.findOne({
                where: {
                    _id: id,
                },
            });
            if (!post) {
                return false;
            }
            if (post.creatorId !== ctx.req.session.user)
                throw Error("Unauthorized User!!");
            await UpVotes_1.UpVotes.delete({
                postId: id,
            });
            await Post_1.Post.delete({
                _id: id,
            });
        }
        catch (error) {
            return false;
        }
        return true;
    }
    async updatePost(title, id) {
        const post = await Post_1.Post.findOne({
            where: {
                _id: id,
            },
        });
        if (!post) {
            return null;
        }
        if (typeof title !== "undefined") {
            await Post_1.Post.update({ _id: id }, { title });
        }
        return post;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit")),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("identifier", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("Title", () => String, { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("Identifier")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
//# sourceMappingURL=post.js.map